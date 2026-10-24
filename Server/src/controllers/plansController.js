const crypto = require("crypto");
const { User } = require("../DB_config");
const config = require("../config/dotenv");
require("dotenv").config();
const { ACCESS_TOKEN, MP_WEBHOOK_SECRET, FRONTEND_URL } = process.env;
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
const PREMIUM_PRICE = 2000;
const PREMIUM_CURRENCY = "ARS";
const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

const withoutTrailingSlash = (url) => url?.replace(/\/+$/, "");

exports.createOrder = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.plan === "premium") {
    throw new Error("Tu cuenta ya tiene el plan Premium activo");
  }

  const frontendUrl = withoutTrailingSlash(FRONTEND_URL);
  const backendUrl = withoutTrailingSlash(process.env.BACKEND_URL);
  if (!frontendUrl || !backendUrl) {
    throw new Error("La configuración de pagos no está completa");
  }

  const preference = {
    body: {
      items: [
        {
          title: "Plan Premium Circula",
          quantity: 1,
          unit_price: PREMIUM_PRICE,
          currency_id: PREMIUM_CURRENCY,
        },
      ],

      // Se compone exclusivamente con el usuario autenticado de la API.
      external_reference: String(userId),

      back_urls: {
        // El cliente usa HashRouter; estas son rutas del frontend, no de la API.
        success: `${frontendUrl}/#/success`,
        failure: `${frontendUrl}/#/failure`,
        pending: `${frontendUrl}/#/pending`,
      },

      auto_return: "approved",

      notification_url: `${backendUrl}/plans/webhook`,
    },
  };

  const response = await new Preference(mpClient).create(preference);

  return response;
};

// Mercado Pago firma cada notificación con un header x-signature.
// Sin esta validación, cualquiera podía pegarle a /plans/webhook y forzar
// una lectura de pago (no podía "inventar" un pago aprobado porque igual
// se consulta la API real de MP, pero sí podía generar carga/ruido).
// Ver: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
exports.verifyWebhookSignature = (req) => {
  if (!MP_WEBHOOK_SECRET) {
    console.warn(
      "MP_WEBHOOK_SECRET no configurado: no se validará la firma solo en desarrollo",
    );
    // En producción se rechaza todo webhook sin secreto, en lugar de aceptar
    // notificaciones que cualquiera podría falsificar.
    return !config.isProd;
  }

  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];
  const dataId = req.query["data.id"];

  if (!xSignature || !xRequestId || !dataId) return false;

  const parts = xSignature.split(",");
  let ts;
  let hash;
  parts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key && key.trim() === "ts") ts = value?.trim();
    if (key && key.trim() === "v1") hash = value?.trim();
  });

  if (!ts || !hash) return false;

  const timestamp = Number(ts);
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (
    !Number.isFinite(timestamp) ||
    Math.abs(nowInSeconds - timestamp) > WEBHOOK_TOLERANCE_SECONDS
  ) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac("sha256", MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return (
    expectedHash.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))
  );
};

exports.webhook = async (data) => {
  try {
    if (data.type !== "payment") return;

    const paymentId = data["data.id"];

    const payment = await new Payment(mpClient).get({ id: paymentId });

    if (payment.status !== "approved") return;

    if (
      Number(payment.transaction_amount) !== PREMIUM_PRICE ||
      payment.currency_id !== PREMIUM_CURRENCY
    ) {
      throw new Error("El pago no coincide con el precio del plan Premium");
    }

    const userId = Number(payment.external_reference);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("El pago no tiene una referencia de usuario válida");
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    if (user.plan === "premium") return; // evitar duplicados

    await user.update({ plan: "premium" });

    return true;
  } catch (error) {
    console.error("Webhook error:", error);
    return { error: error.message };
  }
};

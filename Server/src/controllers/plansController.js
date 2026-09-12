const crypto = require("crypto");
const { User } = require("../DB_config");
require("dotenv").config();
const { ACCESS_TOKEN, MP_WEBHOOK_SECRET, FRONTEND_URL } = process.env;
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

exports.createOrder = async (userId, title) => {
  const preference = {
    body: {
      items: [
        {
          title: title || "Plan Premium Circula",
          quantity: 1,
          unit_price: 2000,
          currency_id: "ARS",
        },
      ],

      external_reference: String(userId), // 🔥 CLAVE: así el webhook sabe a quién activarle el plan

      back_urls: {
        success: `${FRONTEND_URL}/plans/success`,
        failure: `${FRONTEND_URL}/plans/failure`,
        pending: `${FRONTEND_URL}/plans/pending`,
      },

      auto_return: "approved",

      notification_url: `${process.env.BACKEND_URL}/plans/webhook`,
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
    // Si no se configuró el secreto, no bloqueamos (para no romper en dev),
    // pero lo dejamos loggeado para que se note en producción.
    console.warn(
      "MP_WEBHOOK_SECRET no configurado: la firma del webhook no se está validando",
    );
    return true;
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

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac("sha256", MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return expectedHash === hash;
};

exports.webhook = async (data) => {
  try {
    if (data.type !== "payment") return;

    const paymentId = data["data.id"];

    const payment = await new Payment(mpClient).get({ id: paymentId });

    if (payment.status !== "approved") return;

    const userId = payment.external_reference;

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

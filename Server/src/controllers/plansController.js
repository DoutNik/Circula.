const { User } = require("../DB_config");
require("dotenv").config();
const { ACCESS_TOKEN } = process.env;
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

exports.createOrder = async (paymentData) => {
  const { userId, title } = paymentData;

  const preference = {
    body: {
      items: [
        {
          title,
          quantity: 1,
          unit_price: 2000,
          currency_id: "ARS",
        },
      ],

      external_reference: String(userId), // 🔥 CLAVE
      
      back_urls: {
        success: "https://circula.onrender.com/success",
        failure: "https://circula.onrender.com/failure",
        pending: "https://circula.onrender.com/pending",
      },

      auto_return: "approved",

      notification_url: "https://circula-lj9f.onrender.com/plans/webhook",
    },
  };

  const response = await new Preference(mpClient).create(preference);

  return response;
};

exports.webhook = async (data) => {
  try {
    if (data.type !== "payment") return;

    const paymentId = data["data.id"];

    const payment = await new Payment(mpClient).get({ id: paymentId });

    // 🔥 Validaciones CRÍTICAS

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

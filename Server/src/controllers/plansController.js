const { User } = require("../DB_config");
require("dotenv").config();
const { ACCESS_TOKEN } = process.env;
const { MercadoPagoConfig, Preference } = require("mercadopago");

const mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });

let currentUserId;

exports.createOrder = async (paymentData) => {
  const { userId, title, description, price } = paymentData;
  currentUserId = userId;
  try {
    let preference = {
      body: {
        items: [
          {
            userId: userId,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: "ARS",
            description: description,
          },
        ],
        back_urls: {
          failure: "https://locanjeamos.com.ar/#/login",
          pending: "https://locanjeamos.com.ar/#/login",
          success: "https://locanjeamos.com.ar/#/login",
        },
        notification_url:
          "https://lo-canjeamos-production.up.railway.app/plans/webhook",
      },
    };

    const response = await new Preference(mpClient).create(preference);

    return { response, userId };
  } catch (error) {
    console.error("Error al crear preferencia de MP:", error);
    throw new Error(error.message);
  }
};

exports.webhook = async (data) => {
  try {
    if (data.type === "payment") {
      const user = await User.findByPk(currentUserId);

      if (!user) throw new Error("User not found");

      await user.update({ plan: "premium" });
      await user.save();
      return true;
    } else {
      throw new Error("Invalid webhook event type");
    }
  } catch (error) {
    console.error("Error en webhook:", error);
    return {
      error: error.message,
    };
  }
};

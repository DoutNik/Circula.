const { User } = require("../DB_config");
require("dotenv").config();
const { ACCESS_TOKEN } = process.env;
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const mpClient = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN });


exports.createOrder = async (req, res) => {
try {
    const { userId, title, quantity, price, description } = req.body;

    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
        items: [
          {
            title,
            quantity,
            unit_price: price,
            currency_id: "ARS",
            description,
          },
        ],

        external_reference: String(userId),

        notification_url:
          "https://circula-lj9f.onrender.com/webhook",

        back_urls: {
          success: "https://circula.onrender.com/success",
          failure: "https://circula.onrender.com/failure",
          pending: "https://circula.onrender.com/pending",
        },

        auto_return: "approved",
      },
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

exports.webhook = async (data) => {
  try {
    if (data.type !== "payment") return;

    const paymentId = data.data.id;

    const payment = await new Payment(mpClient).get({ id: paymentId });

    if (payment.status !== "approved") return;

    const userId = payment.external_reference;

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    if (user.plan === "premium") return;

    await user.update({ plan: "premium" });

    return true;
  } catch (error) {
    console.error("Webhook error:", error);
    return { error: error.message };
  }
};

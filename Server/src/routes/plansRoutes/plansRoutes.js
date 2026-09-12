const express = require("express");
const router = express.Router();
const plansController = require("../../controllers/plansController");
const authorization = require("../../middleware/authorization");

// Requiere login: el userId del pago sale del token, nunca del body
router.post("/create-order", authorization, async (req, res) => {
  const { title } = req.body;
  const userId = req.body.user;
  try {
    const response = await plansController.createOrder(userId, title);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// El estado real del plan lo actualiza SIEMPRE el webhook, verificando el
// pago contra la API de Mercado Pago. Estas rutas de back_url solo sirven
// para redirigir al usuario a una pantalla amigable; no cambian nada en la DB.
router.get("/success", (req, res) => res.send("Success"));
router.get("/failure", (req, res) => res.send("Failure"));
router.get("/pending", (req, res) => res.send("Pending"));

router.post("/webhook", async (req, res) => {
  try {
    const isValid = plansController.verifyWebhookSignature(req);
    if (!isValid) {
      return res.sendStatus(403);
    }

    await plansController.webhook(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;

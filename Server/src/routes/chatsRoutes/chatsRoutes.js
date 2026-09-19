const express = require("express");
const router = express.Router();

const chatsControllers = require("../../controllers/chatsControllers");
const authorization = require("../../middleware/authorization");
const isAdmin = require("../../middleware/isAdmin");

router.get("/allChats", authorization, isAdmin, async (req, res) => {
  try {
    const response = await chatsControllers.getAllChats();

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener todos los chats:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// Crear chat.
// El usuario autenticado sale SIEMPRE del token.
// El cliente solamente indica con quién quiere iniciar el chat.
router.post("/create", authorization, async (req, res) => {
  try {
    const userId = Number(req.user?.id);
    const anotherUserId = Number(req.body?.anotherUserId);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    if (!Number.isInteger(anotherUserId) || anotherUserId <= 0) {
      return res.status(400).json({
        error: "anotherUserId inválido",
      });
    }

    if (userId === anotherUserId) {
      return res.status(400).json({
        error: "No puedes crear un chat contigo mismo",
      });
    }

    const response = await chatsControllers.createChat(
      userId,
      anotherUserId,
    );

    return res.status(response.created ? 201 : 200).json({
      chatId: response.id,
    });
  } catch (error) {
    console.error("Error al crear el chat:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;

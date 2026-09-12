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
    return res.status(400).json(error.message);
  }
});

// Crear chat: el usuario que llama debe ser una de las dos partes
router.post("/create", authorization, async (req, res) => {
  const { anotherUserId } = req.body;
  const userId = req.body.user;
  try {
    const response = await chatsControllers.createChat(userId, anotherUserId);

    return res.status(201).json({ chatId: response.id });
  } catch (error) {
    console.error("Error al crear el chat:", error);
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;

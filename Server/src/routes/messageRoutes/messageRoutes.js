const express = require("express");
const router = express.Router();

const messageController = require("../../controllers/messageControllers.js");
const authorization = require("../../middleware/authorization");
const isAdmin = require("../../middleware/isAdmin");
const { Chat, User } = require("../../DB_config");

// Solo quienes participan del chat (o un admin) pueden leer/escribir mensajes
const isChatParticipantOrAdmin = async (req, res, next) => {
  try {
    const chat = await Chat.findByPk(req.params.chatId);

    if (!chat) {
      return res.status(404).json("Chat not found");
    }

    const requesterId = String(req.body.user);

    if (
      requesterId === String(chat.user1Id) ||
      requesterId === String(chat.user2Id)
    ) {
      return next();
    }

    const user = await User.findByPk(requesterId);
    if (user && user.rol === "admin") {
      return next();
    }

    return res.status(403).json("Not Authorize");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

router.get("/allMessages", authorization, isAdmin, async (req, res) => {
  try {
    const response = await messageController.getAllMessages();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get(
  "/:chatId",
  authorization,
  isChatParticipantOrAdmin,
  async (req, res) => {
    const { chatId } = req.params;
    try {
      const response = await messageController.getMessages(chatId);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

router.post(
  "/:chatId",
  authorization,
  isChatParticipantOrAdmin,
  async (req, res) => {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.body.user; // siempre el usuario del token
    try {
      const newMessage = await messageController.createMessage(
        chatId,
        userId,
        content,
      );

      return res.status(201).json(newMessage);
    } catch (error) {
      return res.status(400).json(error.message);
    }
  },
);

module.exports = router;

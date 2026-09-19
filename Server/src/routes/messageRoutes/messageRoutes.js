const express = require("express");
const router = express.Router();

const messageController = require("../../controllers/messageControllers.js");
const authorization = require("../../middleware/authorization");
const isAdmin = require("../../middleware/isAdmin");
const { Chat } = require("../../DB_config");

// Solo los participantes del chat o un administrador
// pueden leer/escribir mensajes.
const isChatParticipantOrAdmin = async (req, res, next) => {
  try {
    const requesterId = Number(req.user?.id);

    if (!Number.isInteger(requesterId) || requesterId <= 0) {
      return res.status(401).json({
        error: "Usuario no autenticado",
      });
    }

    const chatId = Number(req.params.chatId);

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({
        error: "chatId inválido",
      });
    }

    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      return res.status(404).json({
        error: "Chat no encontrado",
      });
    }

    // Admin: no necesita pertenecer al chat.
    if (req.user?.rol === "admin") {
      req.chat = chat;
      return next();
    }

    const isParticipant =
      requesterId === Number(chat.user1Id) ||
      requesterId === Number(chat.user2Id);

    if (!isParticipant) {
      return res.status(403).json({
        error: "No autorizado para acceder a este chat",
      });
    }

    // Evita volver a consultar el chat en el controller.
    req.chat = chat;

    return next();
  } catch (error) {
    console.error("Error verificando participante del chat:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

// Solo administradores
router.get("/allMessages", authorization, isAdmin, async (req, res) => {
  try {
    const response = await messageController.getAllMessages();

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener todos los mensajes:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// Obtener mensajes de un chat
router.get(
  "/:chatId",
  authorization,
  isChatParticipantOrAdmin,
  async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);

      const response = await messageController.getMessages(chatId);

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error al obtener mensajes:", error);

      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  },
);

// Crear mensaje
router.post(
  "/:chatId",
  authorization,
  isChatParticipantOrAdmin,
  async (req, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const userId = Number(req.user?.id);
      const { content } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(401).json({
          error: "Usuario no autenticado",
        });
      }

      if (typeof content !== "string") {
        return res.status(400).json({
          error: "El contenido del mensaje es inválido",
        });
      }

      const cleanContent = content.trim();

      if (!cleanContent) {
        return res.status(400).json({
          error: "El mensaje no puede estar vacío",
        });
      }

      if (cleanContent.length > 2000) {
        return res.status(400).json({
          error: "El mensaje no puede superar los 2000 caracteres",
        });
      }

      const newMessage = await messageController.createMessage(
        chatId,
        userId,
        cleanContent,
      );

      return res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error al crear mensaje:", error);

      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  },
);

module.exports = router;


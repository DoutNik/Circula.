const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("./src/config/dotenv");

const router = require("./src/routes/routes");
const { Message, Chat } = require("./src/DB_config");
const { generalLimiter } = require("./src/middleware/rateLimiters");

const app = express();
app.use(express.json());
const httpServer = createServer(app);

// El chat en tiempo real usa el MISMO origen permitido que el resto de la API,
// en vez de "*" (que dejaba conectarse a cualquier sitio).
const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

// Cada conexión de socket debe mandar el JWT (igual que las requests REST)
// para poder identificarse. Sin esto, cualquiera podía unirse a cualquier
// sala de chat y leer/mandar mensajes sin haber iniciado sesión.
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("No token"));
    }
    const payload = jwt.verify(token, process.env.JWTSECRET);
    socket.userId = String(payload.user);
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado");

  socket.on("joinRoom", async (chatId) => {
    try {
      const chat = await Chat.findByPk(chatId);
      if (
        chat &&
        (String(chat.user1Id) === socket.userId ||
          String(chat.user2Id) === socket.userId)
      ) {
        socket.join(String(chatId));
      }
    } catch (error) {
      console.error("Error al unirse a la sala:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado");
  });

  socket.on("chat message", async (messageData) => {
    try {
      const { chatId, content } = messageData;
      const chat = await Chat.findByPk(chatId);

      const isParticipant =
        chat &&
        (String(chat.user1Id) === socket.userId ||
          String(chat.user2Id) === socket.userId);

      if (!isParticipant) return;

      // El userId siempre sale del socket autenticado, nunca del payload
      io.to(String(chatId)).emit("chat message", {
        userId: socket.userId,
        chatId,
        content,
      });
    } catch (error) {
      console.error("Error en chat message:", error.message);
    }
  });
});

const morgan = require("morgan");
const cors = require("cors");

app.use(morgan("dev"));

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "token",
    ],
  }),
);

app.use(generalLimiter);
app.use(router);

module.exports = httpServer;

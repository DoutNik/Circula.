const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const config = require("./src/config/dotenv");

const router = require("./src/routes/routes");
const { Chat } = require("./src/DB_config");
const { generalLimiter } = require("./src/middleware/rateLimiters");

const app = express();
// Render y otros proveedores colocan la app detrás de un proxy. Sin este
// ajuste express-rate-limit vería la IP del proxy como si fuera la de todos.
app.set("trust proxy", 1);
app.set("dbReady", false);
app.disable("x-powered-by");
app.use(
  helmet({
    // Esta API no sirve el frontend; dejamos CSP a cargo del host estático
    // para no romper consumidores de la API ni recursos de Firebase.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
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

app.set("io", io);

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
    const numericChatId = Number(chatId);

    if (!Number.isInteger(numericChatId) || numericChatId <= 0) {
      return;
    }

    const chat = await Chat.findByPk(numericChatId);

    if (!chat) {
      return;
    }

    const isParticipant =
      String(chat.user1Id) === socket.userId ||
      String(chat.user2Id) === socket.userId;

    if (!isParticipant) {
      return;
    }

    socket.join(`chat:${numericChatId}`);

    console.log(
      `Usuario ${socket.userId} ingresó a chat:${numericChatId}`
    );
  } catch (error) {
    console.error(
      "Error al unirse a la sala:",
      error.message
    );
  }
});

  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado");
  });

});

const morgan = require("morgan");
const cors = require("cors");

app.use(morgan("dev"));

// Liveness no toca la base de datos: permite que Render detecte que el proceso
// abrió el puerto mientras PostgreSQL termina de iniciar. /ready sí informa si
// la aplicación está lista para atender tráfico.
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/ready", (req, res) =>
  res.status(req.app.get("dbReady") ? 200 : 503).json({
    status: req.app.get("dbReady") ? "ready" : "starting",
  }),
);

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
app.use((req, res, next) => {
  if (!req.app.get("dbReady")) {
    return res.status(503).json({ error: "El servicio está iniciando. Intenta nuevamente." });
  }
  return next();
});
app.use(router);

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

httpServer.app = app;
module.exports = httpServer;

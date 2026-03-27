const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const config = require("./src/config/dotenv");

const router = require("./src/routes/routes");
const { Message } = require("./src/DB_config");

const app = express();
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  },
});

io.on("connection", (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
  });

  socket.on("disconnect", () => {
    console.log("Un cliente se ha desconectado");
  });

  socket.on('chat message', (messageData) => {
    const { userId, chatId, content } = messageData;
    console.log(`Mensaje recibido para el chat ${chatId} del usuario ${userId}: ${content}`);
    io.to(chatId).emit('chat message', messageData);
  });
});



const morgan = require("morgan");
const cors = require("cors");
const mercadopago = require("mercadopago");

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
  })
);


app.use(router);

module.exports = httpServer;






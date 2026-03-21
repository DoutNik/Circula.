const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const router = require("./src/routes/routes");
const { Message } = require("./src/DB_config");

const app = express();
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
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'https://circula-pvpn.onrender.com'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'token']
}));





app.use(router);

module.exports = httpServer;
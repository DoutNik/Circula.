const nodemailer = require("nodemailer");
require("dotenv").config();

// ⚠️ Las credenciales SIEMPRE salen de variables de entorno.
// Nunca vuelvas a escribir un usuario/contraseña real acá.
const transporter = nodemailer.createTransport(
  {
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  {
    from: process.env.MAIL_FROM || '"Circula" <no-reply@circula.app>',
  },
);

module.exports = { transporter };

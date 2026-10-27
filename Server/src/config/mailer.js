const nodemailer = require("nodemailer");
require("./dotenv");
const { createResendTransport } = require("./resendTransport");
const provider = process.env.MAIL_PROVIDER || (process.env.RENDER ? "resend" : "smtp");
if (!["smtp", "resend"].includes(provider)) throw new Error("MAIL_PROVIDER debe ser smtp o resend");

// ⚠️ Las credenciales SIEMPRE salen de variables de entorno.
// Nunca vuelvas a escribir un usuario/contraseña real acá.
const transporter = provider === "resend"
  ? createResendTransport({ apiKey: process.env.RESEND_API_KEY, from: process.env.MAIL_FROM })
  : nodemailer.createTransport(
  {
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 465,
    secure: (Number(process.env.MAIL_PORT) || 465) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  {
    from: process.env.MAIL_FROM || '"Circula" <no-reply@circula.app>',
  },
);

if (provider === "smtp") transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error SMTP:", error);
  } else {
    console.log("✅ Servidor SMTP listo para enviar emails");
  }
});

module.exports = { transporter };

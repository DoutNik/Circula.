const rateLimit = require("express-rate-limit");

// Límite estricto para login / registro / recuperación de contraseña:
// 10 intentos cada 15 minutos por IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos, probá de nuevo en unos minutos" },
});

// Límite general para el resto de la API: 300 requests cada 15 minutos por IP.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };

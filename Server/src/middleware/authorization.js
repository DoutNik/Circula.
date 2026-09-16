const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  try {
    const jwtToken = req.header("token");

    if (!jwtToken) {
      return res.status(401).json({
        error: "No autorizado: falta el token.",
      });
    }

    const payload = jwt.verify(jwtToken, process.env.JWTSECRET);

    // Soporta payload.user como número o como objeto { id }.
    const rawUserId = payload.user?.id ?? payload.user;
    const userId = Number(rawUserId);

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        error: "No autorizado: token sin usuario válido.",
      });
    }

    // El usuario autenticado queda disponible para las rutas.
    req.authUserId = userId;

    next();
  } catch (error) {
    console.error("Error JWT:", error.message);

    return res.status(401).json({
      error: "No autorizado: token inválido o vencido.",
    });
  }
};
const { User } = require("../DB_config");

// Debe usarse SIEMPRE después de `authorization`.
// Deja pasar si el id del recurso (req.params[paramName]) coincide
// con el usuario autenticado, o si el usuario autenticado es admin.
module.exports = (paramName = "id") => {
  return async (req, res, next) => {
    try {
      const requesterId = String(req.body.user);
      const targetId = String(req.params[paramName]);

      if (requesterId === targetId) {
        return next();
      }

      const user = await User.findByPk(requesterId);

      if (user && user.rol === "admin") {
        return next();
      }

      return res.status(403).json("Not Authorize - Not the owner of this resource");
    } catch (error) {
      console.error("Error isSelfOrAdmin:", error.message);
      return res.status(500).json("Error checking permissions");
    }
  };
};

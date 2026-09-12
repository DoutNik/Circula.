const { User } = require("../DB_config");

// Debe usarse SIEMPRE después de `authorization`, que ya deja
// el id del usuario autenticado en req.body.user
module.exports = async (req, res, next) => {
  try {
    const userId = req.body.user;

    if (!userId) {
      return res.status(403).json("Not Authorize - No user");
    }

    const user = await User.findByPk(userId);

    if (!user || user.rol !== "admin") {
      return res.status(403).json("Not Authorize - Admins only");
    }

    next();
  } catch (error) {
    console.error("Error isAdmin:", error.message);
    return res.status(500).json("Error checking admin permissions");
  }
};

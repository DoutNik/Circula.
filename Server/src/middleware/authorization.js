const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");
    console.log("Token recibido:", jwtToken?.slice(0, 30)); // primeras letras

    if (!jwtToken) {
      return res.status(403).json("Not Authorize - No token");
    }

    const payload = jwt.verify(jwtToken, process.env.JWTSECRET);
    req.body.user = payload.user;
    next();
  } catch (error) {
    console.error("Error JWT:", error.message);
    return res.status(403).json("Not Authorize - Invalid token");
  }
};

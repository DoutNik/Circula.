const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(id) {
    const payload = {
        user: id,
        emailVerified: true
    }
    const token = jwt.sign(payload, process.env.JWTSECRET, { expiresIn: "1hr" });
    return token;
}

module.exports = jwtGenerator;

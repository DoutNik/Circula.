module.exports = function (req, res, next) {
  const { email, username, password } = req.body;

  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  // Al menos 8 caracteres, una letra y un número
  function validPassword(userPassword) {
    return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(userPassword);
  }

  if (req.path === "/register") {
    if (![email, username, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    } else if (!validEmail(email)) {
      return res.status(401).json("Invalid Email");
    } else if (!validPassword(password)) {
      return res
        .status(401)
        .json(
          "La contraseña debe tener al menos 8 caracteres, con letras y números",
        );
    }
  } else if (req.path === "/login") {
    if (![username, password].every(Boolean)) {
      return res.status(401).json("Missing Credentials");
    }
  }

  next();
};

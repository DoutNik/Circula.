module.exports = function (req, res, next) {
  const { email, username, password } = req.body || {};

  if (req.path === "/register") {
    const fieldErrors = {};
    if (typeof username !== "string" || username.trim().length < 3 || username.trim().length > 30) {
      fieldErrors.username = "Elegí un nombre de usuario de entre 3 y 30 caracteres.";
    }
    if (typeof email !== "string" || email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      fieldErrors.email = "Ingresá un correo electrónico válido.";
    }
    if (typeof password !== "string" || /[\r\n]/.test(password) || !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      fieldErrors.password = "Usá al menos 8 caracteres, una letra y un número.";
    } else if (Buffer.byteLength(password, "utf8") > 72) {
      fieldErrors.password = "La contraseña es demasiado larga. Acortala y volvé a intentar.";
    }
    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ error: "Revisá los campos indicados para crear tu cuenta.", fieldErrors });
    }
    req.body.email = email.trim().toLowerCase();
    req.body.username = username.trim();
  } else if (req.path === "/login") {
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json("Ingresá un correo electrónico válido.");
    }
    if (typeof password !== "string" || !password) {
      return res.status(400).json("Ingresá tu contraseña.");
    }
  }

  next();
};

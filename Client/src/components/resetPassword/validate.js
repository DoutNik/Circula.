export const validatePassw = (password) => {
  if (!password || password === "") {
    return "Debes completar el campo";
  }

  if (password.length < 8 || password.length > 20) {
    return "La contraseña debe tener entre 8 y 20 caracteres";
  }

  // Al menos una letra y un número
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;

  if (!passwordRegex.test(password)) {
    return "La contraseña debe incluir al menos una letra y un número";
  }

  return null;
};

export const validateRepeat = (
  passwordRepeat,
  password
) => {
  if (!passwordRepeat || passwordRepeat === "") {
    return "Debes completar el campo";
  }

  if (passwordRepeat !== password) {
    return "Las contraseñas no coinciden";
  }

  return null;
};
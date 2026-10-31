async function authenticateEmail({ email, password }, { findUser, comparePassword }) {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error("Ingresá un correo electrónico válido.");
  }
  if (typeof password !== "string" || !password) throw new Error("Ingresá tu contraseña.");
  const user = await findUser(email.trim().toLowerCase());
  if (!user) throw new Error("No hay una cuenta registrada con ese correo. Podés crear una cuenta.");
  if (user.origin === "google") throw new Error("Esta cuenta usa Google. Elegí «Iniciar sesión con Google».");
  if (!(await comparePassword(password, user.password))) {
    throw new Error("La contraseña es incorrecta. Volvé a intentarlo o recuperá tu contraseña.");
  }
  return user;
}
module.exports = { authenticateEmail };

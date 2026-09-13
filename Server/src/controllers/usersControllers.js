const { User } = require("../DB_config");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { transporter } = require("../config/mailer");
const { registerMail, passwordForgot } = require("../utils/mailObjects");
const jwtGenerator = require("../utils/jwtGenerator");
const admin = require("../config/firebaseAdmin");
const { randomUUID } = require("crypto");

const adminList = process.env.ADMIN_USERS.split(",").map((email) =>
  email.trim(),
);

// Nunca devolver el hash de la contraseña al cliente
const sanitizeUser = (userInstance) => {
  if (!userInstance) return userInstance;
  const plain =
    typeof userInstance.toJSON === "function"
      ? userInstance.toJSON()
      : { ...userInstance };
  delete plain.password;
  return plain;
};

// Campos que un usuario puede modificar de sí mismo.
// "rol" y "plan" quedan afuera a propósito: rol solo se calcula en el
// backend (ver adminList) y plan solo lo cambia el webhook de pagos.
const EDITABLE_USER_FIELDS = ["username", "image", "ubication"];

const pickEditableFields = (updatedData = {}) => {
  const result = {};
  for (const field of EDITABLE_USER_FIELDS) {
    if (updatedData[field] !== undefined) {
      result[field] = updatedData[field];
    }
  }
  return result;
};

exports.getAllUser = async () => {
  try {
    const users = await User.findAll();
    const simplifiedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
      ubication: user.ubication,
      rol: user.rol,
    }));

    return simplifiedUsers;
  } catch (error) {
    throw error;
  }
};

exports.getAllDisabled = async () => {
  try {
    const disabledUsers = await User.findAll({
      where: { paranoid: false },
    });

    return disabledUsers.map(sanitizeUser);
  } catch (error) {
    throw "Ocurrió un error al traer los usuarios: " + error;
  }
};

exports.getAllExisting = async () => {
  try {
    const existingUsers = await User.findAll({
      paranoid: false,
      order: [["id", "ASC"]],
    });

    return existingUsers.map(sanitizeUser);
  } catch (error) {
    throw "Ocurrió un error al traer los usuarios: " + error;
  }
};

exports.createUser = async (user) => {
  if (
    !user.username ||
    !user.email ||
    !user.password ||
    !user.image ||
    !user.ubication
  ) {
    throw new Error("Faltan datos");
  }

  const existEmail = await User.findOne({ where: { email: user.email } });
  const existUsername = await User.findOne({
    where: { username: user.username },
  });

  if (existEmail) throw new Error("El email ya se encuentra registrado");
  if (existUsername) {
    throw new Error("El nombre de usuario ya se encuentra registrado");
  }

  let firebaseUid;

  try {
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(user.password, salt);
    firebaseUid = randomUUID();

    const rol = adminList.includes(user.email) ? "admin" : "user";

    // Firebase se crea con un identificador único, no con el id SQL.
    await admin.auth().createUser({
      uid: firebaseUid,
      email: user.email,
      displayName: user.username,
      photoURL: user.image,
    });

    const newUser = await User.create({
      username: user.username,
      email: user.email,
      password: bcryptPassword,
      image: user.image,
      ubication: user.ubication,
      rol,
      origin: user.origin || "local",
      firebaseUid,
    });

    const token = jwtGenerator(newUser.id);
    const firebaseToken = await admin.auth().createCustomToken(firebaseUid);

    transporter
      .sendMail(registerMail(user))
      .catch((err) => console.error("Email error:", err));

    return { newUser: sanitizeUser(newUser), token, firebaseToken };
  } catch (error) {
    // Evita dejar una cuenta Firebase huérfana si luego falla la DB.
    if (firebaseUid) {
      await admin
        .auth()
        .deleteUser(firebaseUid)
        .catch(() => {});
    }

    if (error.code === "auth/uid-already-exists") {
      const duplicateError = new Error("El usuario ya existe en Firebase.");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
};

exports.socialRegisterOrLogin = async (user) => {
  try {
    let usuarios = await User.findAll({ where: { email: user.email } });
    let usuario;
    let firebaseUid;

    const rolCalculado = adminList.includes(user.email) ? "admin" : "user";

    if (usuarios.length === 0) {
      // Crear usuario si no existe
      firebaseUid = randomUUID();
      usuario = await User.create({
        username: user.username,
        email: user.email,
        password: "SOCIAL_LOGIN",
        image: user.image,
        ubication: user.ubication || "No especificada",
        origin: user.origin,
        rol: rolCalculado,
        firebaseUid,
      });
    } else {
      usuario = usuarios[0];

      // Verificar si el rol cambió y actualizar
      if (usuario.rol !== rolCalculado) {
        await usuario.update({ rol: rolCalculado });
      }
    }

    const token = jwtGenerator(usuario.id);

    const firebaseToken = await admin
      .auth()
      .createCustomToken(usuario.firebaseUid);

    return {
      usuario: sanitizeUser(usuario),
      token,
      firebaseToken,
      rol: rolCalculado,
    };
  } catch (error) {
    console.error("Error socialRegisterOrLogin:", error);
    throw new Error("Error al autenticar con red social");
  }
};

exports.loginUser = async (user) => {
  let usuario;

  if (user.origin === "google") {
    usuario = await User.findOne({ where: { email: user.email } });
  } else {
    usuario = await User.findOne({ where: { username: user.username } });

    if (usuario && !(await bcrypt.compare(user.password, usuario.password))) {
      throw new Error("La contraseña es incorrecta");
    }
  }

  if (!usuario) throw new Error("No existe ningún usuario con ese nombre");

  // determinar rol
  const rolCalculado = adminList.includes(usuario.email) ? "admin" : "user";
  console.log(adminList);
  console.log(usuario.email, rolCalculado);
  console.log(usuario.rol);

  // actualizar rol si cambió
  if (usuario.rol !== rolCalculado) {
    await usuario.update({ rol: rolCalculado });
  }

  const token = jwtGenerator(usuario.id);

  const firebaseToken = await admin
    .auth()
    .createCustomToken(usuario.id.toString());

  return {
    usuario: sanitizeUser(usuario),
    token,
    firebaseToken,
    rol: rolCalculado,
  };
};

exports.getUserId = async (user) => {
  try {
    const userId = await User.findByPk(user);

    return sanitizeUser(userId);
  } catch (error) {
    throw new Error("Error al iniciar sesión");
  }
};

exports.getUserById = async (id) => {
  try {
    const user = await User.findByPk(id);

    return sanitizeUser(user);
  } catch (error) {
    throw error;
  }
};

exports.userLogueado = async ({ email }) => {
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    return user !== null;
  } catch (error) {
    throw new Error("Error al iniciar sesión");
  }
};

exports.updateUser = async (id, updatedData, requester) => {
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    // Un admin puede además cambiar el "plan" manualmente si hiciera falta,
    // pero nunca el rol vía este endpoint (el rol se calcula solo, ver adminList).
    let fieldsToApply = pickEditableFields(updatedData);

    if (requester && requester.rol === "admin") {
      if (updatedData.plan !== undefined) {
        fieldsToApply.plan = updatedData.plan;
      }
    }

    await user.update(fieldsToApply);

    return sanitizeUser(user);
  } catch (error) {
    throw error;
  }
};

exports.deleteUser = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("User not found");
  }

  try {
    if (user.firebaseUid) {
      await admin.auth().deleteUser(user.firebaseUid);
    }

    await user.destroy();

    return true;
  } catch (error) {
    // Si Firebase ya no tenía la cuenta, igualmente elimina el usuario local.
    if (error.code === "auth/user-not-found") {
      await user.destroy();
      return true;
    }

    console.error("Error al eliminar usuario:", error);
    throw new Error("No se pudo eliminar el usuario de Firebase");
  }
};

exports.forgotPassword = async (email) => {
  try {
    const usuario = await User.findOne({ where: { email } });

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    if (!usuario) {
      throw new Error("El usuario no existe");
    }
    transporter
      .sendMail(passwordForgot(email, usuario.id))
      .catch((err) => console.error("Email error:", err));
    return "El mail fue enviado correctamente";
  } catch (error) {
    throw error;
  }
};

exports.resetPassword = async (id, newPassword) => {
  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new Error("User not found", error);
    }
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: bcryptPassword });

    return "Contraseña actualizada correctamente";
  } catch (error) {
    console.error(error);
    throw new Error("No se pudo actualizar la contraseña", error);
  }
};

exports.restoreUser = async (id) => {
  try {
    const userDisabled = await User.findByPk(id, { paranoid: false });

    if (!userDisabled) {
      throw new Error("El usuario que intenta restaurar no se encuentra.");
    }

    await userDisabled.restore();
    return sanitizeUser(userDisabled);
  } catch (error) {
    throw error;
  }
};

exports.getAnotherUser = async (id) => {
  try {
    const userId = await User.findByPk(id);

    return sanitizeUser(userId);
  } catch (error) {
    throw new Error("Error al iniciar sesión");
  }
};

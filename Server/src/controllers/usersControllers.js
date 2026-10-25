const {
  User,
  PasswordResetToken,
  AccountDeletionToken,
  Post,
  Like,
  Matches,
  Chat,
  Message,
  Review,
  Report,
  UserBlock,
  conn: sequelize,
} = require("../DB_config");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { transporter } = require("../config/mailer");
const { registerMail, passwordForgot, accountDeletionMail } = require("../utils/mailObjects");
const jwtGenerator = require("../utils/jwtGenerator");
const admin = require("../config/firebaseAdmin");
const { randomUUID, randomBytes, createHash } = require("crypto");
const { Op } = require("sequelize");

const adminList = (process.env.ADMIN_USERS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Nunca devolver el hash de la contraseña al cliente
const sanitizeUser = (userInstance) => {
  if (!userInstance) return userInstance;
  const plain =
    typeof userInstance.toJSON === "function"
      ? userInstance.toJSON()
      : { ...userInstance };
  delete plain.password;
  delete plain.fcmToken;
  return plain;
};

// Perfil expuesto a otros usuarios: nunca incluye correo, identificadores de
// Firebase, tokens ni el rol/plan interno.
const sanitizePublicUser = (userInstance) => {
  const plain = sanitizeUser(userInstance);
  if (!plain) return plain;
  delete plain.email;
  delete plain.firebaseUid;
  delete plain.rol;
  delete plain.plan;
  delete plain.origin;
  return plain;
};

// Campos que un usuario puede modificar de sí mismo.
// "rol" y "plan" quedan afuera a propósito: rol solo se calcula en el
// backend (ver adminList) y plan solo lo cambia el webhook de pagos.
const EDITABLE_USER_FIELDS = ["username", "image", "ubication"];
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESET_SUCCESS_MESSAGE =
  "Si existe una cuenta con ese correo, enviaremos un enlace para restablecer la contraseña.";

const hashResetToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const isValidResetPassword = (password) =>
  typeof password === "string" &&
  Buffer.byteLength(password, "utf8") <= 72 &&
  /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

const pickEditableFields = (updatedData = {}) => {
  const result = {};
  for (const field of EDITABLE_USER_FIELDS) {
    if (updatedData[field] !== undefined) {
      result[field] = updatedData[field];
    }
  }
  return result;
};

const socialProviderNames = {
  "google.com": "google",
  "facebook.com": "facebook",
};

const buildUniqueSocialUsername = async (name, email, firebaseUid) => {
  const preferredName = name || email.split("@")[0] || "usuario";
  const normalizedBase = preferredName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 40) || "usuario";
  const suffix = firebaseUid.replace(/[^a-zA-Z0-9]/g, "").slice(-8) || "social";
  const baseUsername = `${normalizedBase}-${suffix}`;
  let username = baseUsername;
  let attempt = 1;

  while (await User.findOne({ where: { username }, paranoid: false })) {
    username = `${baseUsername}-${attempt}`;
    attempt += 1;
  }

  return username;
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
      paranoid: false,
      where: { Deshabilitado: { [Op.not]: null } },
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

    const rol = adminList.includes(user.email.trim().toLowerCase()) ? "admin" : "user";

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
      origin: "local",
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

exports.socialRegisterOrLogin = async (idToken) => {
  try {
    if (typeof idToken !== "string" || !idToken.trim()) {
      throw new Error("Falta el token de identidad de Firebase.");
    }

    // La identidad, email, nombre, foto y proveedor salen exclusivamente de
    // un token firmado por Firebase; nunca del body que controla el navegador.
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email?.trim().toLowerCase();
    const provider = decodedToken.firebase?.sign_in_provider;

    if (!email || decodedToken.email_verified !== true) {
      throw new Error("La cuenta social debe tener un correo verificado.");
    }

    if (!socialProviderNames[provider]) {
      throw new Error("Proveedor de inicio de sesión no permitido.");
    }

    let usuario = await User.findOne({
      where: {
        [Op.or]: [{ firebaseUid }, { email }],
      },
      paranoid: false,
    });

    if (usuario?.Deshabilitado) {
      throw new Error("Esta cuenta no está disponible.");
    }

    const rolCalculado = adminList.includes(email) ? "admin" : "user";

    if (!usuario) {
      const username = await buildUniqueSocialUsername(
        decodedToken.name,
        email,
        firebaseUid,
      );

      usuario = await User.create({
        username,
        email,
        // Las cuentas sociales no pueden autenticarse por el endpoint local;
        // se conserva un hash para cumplir el esquema, no una clave utilizable.
        password: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
        image: decodedToken.picture || null,
        ubication: "No especificada",
        origin: socialProviderNames[provider],
        rol: rolCalculado,
        firebaseUid,
      });
    } else if (usuario.rol !== rolCalculado) {
      // El rol sigue derivándose del servidor, nunca de datos del cliente.
      await usuario.update({ rol: rolCalculado });
    }

    const token = jwtGenerator(usuario.id);

    return {
      usuario: sanitizeUser(usuario),
      token,
      rol: rolCalculado,
    };
  } catch (error) {
    console.error("Error socialRegisterOrLogin:", error);
    throw new Error("Error al autenticar con red social");
  }
};

exports.loginUser = async (user) => {
  const usuario = await User.findOne({ where: { username: user.username } });

  if (usuario && !(await bcrypt.compare(user.password, usuario.password))) {
    throw new Error("La contraseña es incorrecta");
  }

  if (!usuario) throw new Error("No existe ningún usuario con ese nombre");

  // determinar rol
  const rolCalculado = adminList.includes(usuario.email.toLowerCase()) ? "admin" : "user";
  // actualizar rol si cambió
  if (usuario.rol !== rolCalculado) {
    await usuario.update({ rol: rolCalculado });
  }

  const token = jwtGenerator(usuario.id);

  const firebaseToken = await admin
    .auth()
    .createCustomToken(usuario.firebaseUid || usuario.id.toString());

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

    return sanitizePublicUser(user);
  } catch (error) {
    throw error;
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
  const user = await User.findByPk(id, { paranoid: false });

  if (!user || user.Deshabilitado) {
    throw new Error("User not found");
  }

  try {
    if (user.firebaseUid) {
      try {
        await admin.auth().deleteUser(user.firebaseUid);
      } catch (error) {
        // La identidad ya puede haber sido eliminada en Firebase. En ese caso
        // todavía debemos borrar todos los datos locales de la cuenta.
        if (error.code !== "auth/user-not-found") {
          throw error;
        }
      }
    }

    await sequelize.transaction(async (transaction) => {
      const [posts, chats, reviewsWritten] = await Promise.all([
        Post.findAll({
          where: { UserId: id },
          attributes: ["id"],
          paranoid: false,
          transaction,
          lock: transaction.LOCK.UPDATE,
        }),
        Chat.findAll({
          where: { [Op.or]: [{ user1Id: id }, { user2Id: id }] },
          attributes: ["id"],
          transaction,
          lock: transaction.LOCK.UPDATE,
        }),
        Review.findAll({
          where: { userId: id },
          attributes: ["reviewedUserId"],
          transaction,
        }),
      ]);

      const postIds = posts.map((post) => post.id);
      const chatIds = chats.map((chat) => chat.id);
      const affectedRevieweeIds = [
        ...new Set(reviewsWritten.map((review) => review.reviewedUserId)),
      ].filter((reviewedUserId) => Number(reviewedUserId) !== Number(id));

      const likeConditions = [{ myUserId: id }, { anotherUserId: id }];
      const matchConditions = [{ UserId1: id }, { UserId2: id }];

      if (postIds.length) {
        likeConditions.push(
          { myPostId: { [Op.in]: postIds } },
          { likedPostId: { [Op.in]: postIds } },
        );
        matchConditions.push(
          { PostId1: { [Op.in]: postIds } },
          { PostId2: { [Op.in]: postIds } },
        );
      }

      const messageConditions = [{ userId: id }];
      if (chatIds.length) {
        messageConditions.push({ chatId: { [Op.in]: chatIds } });
      }

      await Promise.all([
        Message.destroy({
          where: { [Op.or]: messageConditions },
          force: true,
          transaction,
        }),
        Chat.destroy({
          where: { [Op.or]: [{ user1Id: id }, { user2Id: id }] },
          force: true,
          transaction,
        }),
        Like.destroy({
          where: { [Op.or]: likeConditions },
          force: true,
          transaction,
        }),
        Matches.destroy({
          where: { [Op.or]: matchConditions },
          force: true,
          transaction,
        }),
        Review.destroy({
          where: { [Op.or]: [{ userId: id }, { reviewedUserId: id }] },
          force: true,
          transaction,
        }),
        PasswordResetToken.destroy({
          where: { userId: id },
          force: true,
          transaction,
        }),
        AccountDeletionToken.destroy({
          where: { userId: id },
          force: true,
          transaction,
        }),
        Report.destroy({
          where: {
            [Op.or]: [
              { reporterUserId: id },
              { targetUserId: id },
            ],
          },
          force: true,
          transaction,
        }),
        UserBlock.destroy({
          where: {
            [Op.or]: [{ blockerUserId: id }, { blockedUserId: id }],
          },
          force: true,
          transaction,
        }),
      ]);

      if (postIds.length) {
        await Post.destroy({
          where: { id: { [Op.in]: postIds } },
          force: true,
          transaction,
        });
      }

      for (const reviewedUserId of affectedRevieweeIds) {
        const remainingReviews = await Review.findAll({
          where: { reviewedUserId },
          attributes: ["rating"],
          transaction,
        });
        const averageRating = remainingReviews.length
          ? Number(
              (
                remainingReviews.reduce(
                  (sum, review) => sum + review.rating,
                  0,
                ) / remainingReviews.length
              ).toFixed(2),
            )
          : 0;

        await User.update(
          { averageRating },
          { where: { id: reviewedUserId }, transaction },
        );
      }

      await user.destroy({ force: true, transaction });
    });

    return true;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw new Error("No se pudo eliminar la cuenta y sus datos asociados");
  }
};

exports.disableUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("User not found");
  }

  await user.destroy();
  return true;
};

exports.forgotPassword = async (email) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // La respuesta no revela si un correo existe, para evitar enumeración de
  // cuentas. Los errores operativos se registran únicamente en el servidor.
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    return RESET_SUCCESS_MESSAGE;
  }

  try {
    const usuario = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (!usuario) {
      return RESET_SUCCESS_MESSAGE;
    }

    const resetToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // Solo queda un enlace válido por usuario. Solicitar uno nuevo invalida el
    // anterior y el token en claro nunca entra a la base de datos.
    await PasswordResetToken.upsert({
      userId: usuario.id,
      tokenHash: hashResetToken(resetToken),
      expiresAt,
      usedAt: null,
    });

    await transporter.sendMail(passwordForgot(normalizedEmail, resetToken));
  } catch (error) {
    console.error("ERROR forgotPassword controller:", error);
  }

  return RESET_SUCCESS_MESSAGE;
};

exports.resetPassword = async (resetToken, newPassword) => {
  if (typeof resetToken !== "string" || resetToken.length < 40) {
    throw new Error("El enlace de recuperación es inválido o venció.");
  }

  if (!isValidResetPassword(newPassword)) {
    throw new Error(
      "La contraseña debe tener al menos 8 caracteres, una letra y un número.",
    );
  }

  const tokenHash = hashResetToken(resetToken);

  return sequelize.transaction(async (transaction) => {
    const passwordReset = await PasswordResetToken.findOne({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!passwordReset) {
      throw new Error("El enlace de recuperación es inválido o venció.");
    }

    const user = await User.findByPk(passwordReset.userId, { transaction });

    if (!user) {
      throw new Error("El enlace de recuperación es inválido o venció.");
    }

    const bcryptPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: bcryptPassword }, { transaction });
    await passwordReset.update({ usedAt: new Date() }, { transaction });

    return "Contraseña actualizada correctamente";
  });
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

    return sanitizePublicUser(userId);
  } catch (error) {
    throw new Error("Error al iniciar sesión");
  }
};

exports.savePushToken = async (userId, token) => {
  if (typeof token !== "string" || token.length < 20 || token.length > 512) {
    throw new Error("Token de notificación inválido.");
  }
  const user = await User.findByPk(userId);
  if (!user) throw new Error("Usuario no encontrado.");
  await user.update({ fcmToken: token });
};

exports.requestAccountDeletion = async (email) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const genericMessage = "Si existe una cuenta con ese correo, enviaremos un enlace para confirmar su eliminación.";
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return genericMessage;
  }

  try {
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return genericMessage;
    const deletionToken = randomBytes(32).toString("base64url");
    await AccountDeletionToken.upsert({
      userId: user.id,
      tokenHash: hashResetToken(deletionToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      usedAt: null,
    });
    await transporter.sendMail(accountDeletionMail(user.email, deletionToken));
  } catch (error) {
    console.error("ERROR requestAccountDeletion:", error);
  }
  return genericMessage;
};

exports.deleteUserByToken = async (deletionToken) => {
  if (typeof deletionToken !== "string" || deletionToken.length < 40) {
    throw new Error("El enlace de eliminación es inválido o venció.");
  }
  const tokenHash = hashResetToken(deletionToken);
  const deletion = await AccountDeletionToken.findOne({
    where: { tokenHash, usedAt: null, expiresAt: { [Op.gt]: new Date() } },
  });
  if (!deletion) throw new Error("El enlace de eliminación es inválido o venció.");
  await deletion.update({ usedAt: new Date() });
  await exports.deleteUser(deletion.userId);
};

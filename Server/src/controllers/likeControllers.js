const { Like, Matches, User, Post } = require("../DB_config");
const { transporter } = require("../config/mailer");
const { matchMail } = require("../utils/mailObjects");

const createLike = async (myUserId, likedPostId, myPostId, anotherUserId) => {
  try {
    // ❗ evitar duplicados
    const existing = await Like.findOne({
      where: {
        myUserId,
        likedPostId,
        myPostId,
      },
    });

    if (existing) {
      throw new Error("Ya enviaste esta solicitud");
    }

    const like = await Like.create({
      myUserId,
      likedPostId,
      myPostId,
      anotherUserId,
      status: "pending",
    });

    return like;
  } catch (error) {
    throw new Error("Error al dar like: " + error.message);
  }
};

const getAllLikes = async () => {
  try {
    const likes = await Like.findAll();

    return likes;
  } catch (error) {
    throw error;
  }
};

const getLikesRecibidos = async (myUserId) => {
  try {
    const likesRecibidos = await Like.findAll({
      where: {
        anotherUserId: myUserId,
        status: "pending", // 🔥 importante
      },
    });

    return likesRecibidos.map((like) => ({
      id: like.id, // ✅ CLAVE
      likedPostId: like.likedPostId,
      myPostId: like.myPostId,
      status: like.status,
    }));
  } catch (error) {
    throw new Error("Error al obtener likes recibidos: " + error.message);
  }
};

const acceptLike = async (likeId) => {
  const like = await Like.findByPk(likeId);

  if (!like) throw new Error("Like no encontrado");

  if (like.status !== "pending") {
    throw new Error("Ya procesado");
  }

  like.status = "accepted";
  await like.save();

  // 🔥 Crear match
  const match = await Matches.create({
    UserId1: like.myUserId,
    UserId2: like.anotherUserId,
    PostId1: like.myPostId,
    PostId2: like.likedPostId,
    EmailSended: true,
  });

  // 🔥 Obtener datos
  const firstUser = await User.findByPk(like.myUserId);
  const secondUser = await User.findByPk(like.anotherUserId);
  const firstPost = await Post.findByPk(like.myPostId);
  const secondPost = await Post.findByPk(like.likedPostId);

  // 🔥 Email
  transporter.sendMail(matchMail(firstUser, secondUser, firstPost, secondPost));

  return match;
};

const rejectLike = async (likeId) => {
  const like = await Like.findByPk(likeId);

  if (!like) throw new Error("Like no encontrado");

  like.status = "rejected";
  await like.save();

  // 🔥 eliminar relación
  await Like.destroy({
    where: {
      myPostId: like.myPostId,
      likedPostId: like.likedPostId,
    },
  });

  return like;
};

const removeLike = async (likeId) => {
  try {
    // Busca el like por la propiedad "likedPostId"
    const likeToRemove = await Like.findOne({
      where: { likedPostId: likeId },
    });

    // Verifica si el like existe
    if (!likeToRemove) {
      throw new Error(
        "No se encontró el like con el likedPostId proporcionado",
      );
    }

    // Obtiene el ID del post que le dio like
    const likedPostId = likeToRemove.likedPostId;

    // Elimina el like
    await likeToRemove.destroy();

    return likedPostId; // Devuelve el ID del post que le dio like
  } catch (error) {
    throw new Error("Error al eliminar el like: " + error.message);
  }
};

module.exports = {
  createLike,
  getAllLikes,
  getLikesRecibidos,
  removeLike,
  rejectLike,
  acceptLike,
};

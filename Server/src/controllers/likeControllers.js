const { Like, Matches, User, Post, conn: sequelize } = require("../DB_config");
const { Op } = require("sequelize");
const { transporter } = require("../config/mailer");
const { matchMail } = require("../utils/mailObjects");


const createLike = async (
  myUserId,
  likedPostId,
  myPostId,
  anotherUserId,
) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Evitar duplicar exactamente el mismo intento
    const existing = await Like.findOne({
      where: {
        myUserId,
        likedPostId,
        myPostId,
      },
      transaction,
    });

    if (existing) {
      throw new Error("Ya enviaste esta solicitud");
    }

    // 2. Buscar si el otro usuario ya hizo el pedido inverso
    const reciprocalLike = await Like.findOne({
      where: {
        myUserId: anotherUserId,
        anotherUserId: myUserId,
        myPostId: likedPostId,
        likedPostId: myPostId,
        status: "pending",
      },
      transaction,
    });

    // 3. Crear mi like
    const like = await Like.create(
      {
        myUserId,
        likedPostId,
        myPostId,
        anotherUserId,
        status: reciprocalLike ? "matched" : "pending",
      },
      { transaction },
    );

    // =====================================================
    // NO HAY MATCH TODAVÍA
    // =====================================================

    if (!reciprocalLike) {
      await transaction.commit();

      return {
        success: true,
        matched: false,
        like,
      };
    }

    // =====================================================
    // HAY MATCH
    // =====================================================

    // 4. Marcar el like anterior como matched
    reciprocalLike.status = "matched";
    await reciprocalLike.save({ transaction });

    // 5. Evitar crear un Match duplicado
    const existingMatch = await Matches.findOne({
      where: {
        [Op.or]: [
          {
            UserId1: myUserId,
            UserId2: anotherUserId,
            PostId1: myPostId,
            PostId2: likedPostId,
          },
          {
            UserId1: anotherUserId,
            UserId2: myUserId,
            PostId1: likedPostId,
            PostId2: myPostId,
          },
        ],
      },
      transaction,
    });

    let match = existingMatch;

    // 6. Crear el Match
    if (!match) {
      match = await Matches.create(
        {
          UserId1: myUserId,
          UserId2: anotherUserId,
          PostId1: myPostId,
          PostId2: likedPostId,
          EmailSended: true,
        },
        { transaction },
      );
    }

    await transaction.commit();

    // =====================================================
    // EMAIL FUERA DE LA TRANSACCIÓN
    // =====================================================

    try {
      const firstUser = await User.findByPk(myUserId);
      const secondUser = await User.findByPk(anotherUserId);
      const firstPost = await Post.findByPk(myPostId);
      const secondPost = await Post.findByPk(likedPostId);

      await transporter.sendMail(
        matchMail(
          firstUser,
          secondUser,
          firstPost,
          secondPost,
        ),
      );
    } catch (mailError) {
      console.error(
        "⚠️ Match creado, pero no se pudo enviar el email:",
        mailError,
      );
    }

    return {
      success: true,
      matched: true,
      match,
    };
  } catch (error) {
    await transaction.rollback();

    throw new Error(
      "Error al dar like: " + error.message,
    );
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

  if (!like) {
    throw new Error("Like no encontrado");
  }

  if (like.status !== "pending") {
    throw new Error("Ya procesado");
  }

  // Buscar si ya existe el like inverso
  const reciprocalLike = await Like.findOne({
    where: {
      myUserId: like.anotherUserId,
      anotherUserId: like.myUserId,
      myPostId: like.likedPostId,
      likedPostId: like.myPostId,
      status: "pending",
    },
  });

  // Si existe, crear match
  if (reciprocalLike) {
    like.status = "matched";
    reciprocalLike.status = "matched";

    await like.save();
    await reciprocalLike.save();

    const existingMatch = await Matches.findOne({
      where: {
        [Op.or]: [
          {
            UserId1: like.myUserId,
            UserId2: like.anotherUserId,
            PostId1: like.myPostId,
            PostId2: like.likedPostId,
          },
          {
            UserId1: like.anotherUserId,
            UserId2: like.myUserId,
            PostId1: like.likedPostId,
            PostId2: like.myPostId,
          },
        ],
      },
    });

    if (existingMatch) {
      return existingMatch;
    }

    const match = await Matches.create({
      UserId1: like.myUserId,
      UserId2: like.anotherUserId,
      PostId1: like.myPostId,
      PostId2: like.likedPostId,
      EmailSended: true,
    });

    return match;
  }

  // Si todavía no existe el pedido inverso,
  // simplemente queda pendiente.
  return like;
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

const getLikesEnviados = async (myUserId) => {
  const likes = await Like.findAll({
    where: {
      myUserId,
      status: "pending",
    },
  });

  return likes;
};

module.exports = {
  createLike,
  getAllLikes,
  getLikesRecibidos,
  getLikesEnviados,
  removeLike,
  rejectLike,
  acceptLike,
};

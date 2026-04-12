const { User, Post, Matches } = require("../DB_config");
const { Op } = require("sequelize");

// Función para encontrar matches
const findMatches = async (userId) => {
  try {
    const matches = await Matches.findAll({
      where: {
        [Op.or]: [{ UserId1: userId }, { UserId2: userId }],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Post,
          as: "post1",
          attributes: ["id", "title", "image", "UserId"],
          include: [
            {
              model: User,
              as: "owner", // 🔥 CLAVE
              attributes: ["id", "username", "image"],
            },
          ],
        },
        {
          model: Post,
          as: "post2",
          attributes: ["id", "title", "image", "UserId"],
          include: [
            {
              model: User,
              as: "owner", // 🔥 CLAVE
              attributes: ["id", "username", "image"],
            },
          ],
        },
      ],
    });

    return matches.map((m) => {
      const isMine = m.UserId1 === userId;

      const myPost = isMine ? m.post1 : m.post2;
      const anotherPost = isMine ? m.post2 : m.post1;

      return {
        id: m.id,
        myPost,
        anotherPost,
      };
    });
  } catch (error) {
    throw new Error("Error al obtener matches: " + error.message);
  }
};

module.exports = {
  findMatches,
};

const { User, Post, Matches } = require("../DB_config");
const { Op } = require("sequelize");

// Función para encontrar matches
const findMatches = async (userId) => {
  try {
    console.log("🔎 findMatches userId:", userId);

    const matches = await Matches.findAll({
      where: {
        [Op.or]: [
          { UserId1: userId },
          { UserId2: userId },
        ],
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
              as: "owner",
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
              as: "owner",
              attributes: ["id", "username", "image"],
            },
          ],
        },
      ],
    });

    console.log("✅ DB matches:", matches.length);

    return matches.map((m) => {
      const isMine = Number(m.UserId1) === Number(userId);

      const myPost = isMine ? m.post1 : m.post2;
      const anotherPost = isMine ? m.post2 : m.post1;

      return {
        id: m.id,
        myPost,
        anotherPost,
      };
    });
  } catch (error) {
    console.error("❌ ERROR REAL findMatches:");
    console.error(error);
    console.error("❌ message:", error.message);
    console.error("❌ name:", error.name);
    console.error("❌ parent:", error.parent);
    console.error("❌ original:", error.original);

    throw error;
  }
};

const findAllMatches = async () => {
  return Matches.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Post,
        as: "post1",
        attributes: ["id", "title", "image", "UserId"],
        include: [
          {
            model: User,
            as: "owner",
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
            as: "owner",
            attributes: ["id", "username", "image"],
          },
        ],
      },
    ],
  });
};


module.exports = {
  findAllMatches,
  findMatches,
};

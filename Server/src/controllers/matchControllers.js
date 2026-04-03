const { User, Post, Matches } = require("../DB_config");
const { Op } = require("sequelize");


// Función para encontrar matches
const findMatches = async (userId) => {
  try {
    const matches = await Matches.findAll({
      where: {
        [Op.or]: [
          { UserId1: userId },
          { UserId2: userId },
        ],
      },
    });

    const results = await Promise.all(
      matches.map(async (match) => {
        const [user1, user2, post1, post2] = await Promise.all([
          User.findByPk(match.UserId1),
          User.findByPk(match.UserId2),
          Post.findByPk(match.PostId1),
          Post.findByPk(match.PostId2),
        ]);

        return {
          id: match.id,
          users: [user1, user2],
          posts: [post1, post2],
        };
      })
    );

    return results;
  } catch (error) {
    throw new Error("Error al obtener matches: " + error.message);
  }
};

module.exports = {
  findMatches
};

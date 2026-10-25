const { Op } = require("sequelize");
const { User, UserBlock } = require("../DB_config");

const blockPairWhere = (firstUserId, secondUserId) => ({
  [Op.or]: [
    { blockerUserId: firstUserId, blockedUserId: secondUserId },
    { blockerUserId: secondUserId, blockedUserId: firstUserId },
  ],
});

const isEitherUserBlocked = async (firstUserId, secondUserId, options = {}) =>
  Boolean(await UserBlock.findOne({ where: blockPairWhere(firstUserId, secondUserId), ...options }));

const createBlock = async (blockerUserId, blockedUserId) => {
  if (Number(blockerUserId) === Number(blockedUserId)) {
    throw new Error("No puedes bloquearte a ti mismo.");
  }

  const target = await User.findByPk(blockedUserId);
  if (!target) throw new Error("El usuario que quieres bloquear no existe.");

  const [block] = await UserBlock.findOrCreate({
    where: { blockerUserId, blockedUserId },
    defaults: { blockerUserId, blockedUserId },
  });

  return block;
};

const removeBlock = async (blockerUserId, blockedUserId) => {
  const removed = await UserBlock.destroy({
    where: { blockerUserId, blockedUserId },
  });
  if (!removed) throw new Error("No existía ese bloqueo.");
};

const listBlocks = (blockerUserId) =>
  UserBlock.findAll({
    where: { blockerUserId },
    include: [{ model: User, as: "blockedUser", attributes: ["id", "username", "image"] }],
    order: [["createdAt", "DESC"]],
  });

module.exports = { createBlock, removeBlock, listBlocks, isEitherUserBlocked };

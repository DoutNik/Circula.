const { Op } = require("sequelize");
const { Chat, User } = require("../DB_config");

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

exports.createChat = async (userId, anotherUserId) => {
  try {
    const existingChat = await Chat.findOne({
      where: {
        [Op.or]: [
          {
            user1Id: userId,
            user2Id: anotherUserId,
          },
          {
            user1Id: anotherUserId,
            user2Id: userId,
          },
        ],
      },
    });

    // Hacemos createChat idempotente.
    if (existingChat) {
      return {
        ...existingChat,
        id: existingChat.id,
        created: false,
      };
    }

    const anotherUser = await User.findByPk(anotherUserId);

    if (!anotherUser) {
      throw createHttpError(404, "El usuario destinatario no existe");
    }

    const newChat = await Chat.create({
      user1Id: userId,
      user2Id: anotherUserId,
    });

    return {
      ...newChat,
      id: newChat.id,
      created: true,
    };
  } catch (error) {
    console.error("Error al crear el chat:", error);
    throw error;
  }
};

exports.getAllChats = async () => {
  try {
    const chats = await Chat.findAll({
      order: [["createdAt", "ASC"]],
    });

    return chats;
  } catch (error) {
    console.error("Error al obtener todos los chats:", error);
    throw error;
  }
};

exports.getChatsByUserId = async (userId) => {
  const chats = await Chat.findAll({
    where: {
      [Op.or]: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: [
      {
        model: User,
        as: "user1",
        attributes: ["id", "username", "image"],
      },
      {
        model: User,
        as: "user2",
        attributes: ["id", "username", "image"],
      },
    ],
    order: [["updatedAt", "DESC"]],
  });

  return chats.map((chat) => {
    const chatData = chat.toJSON();

    const otherUser =
      Number(chatData.user1Id) === Number(userId)
        ? chatData.user2
        : chatData.user1;

    return {
      id: chatData.id,
      user1Id: chatData.user1Id,
      user2Id: chatData.user2Id,
      otherUser,
    };
  });
};


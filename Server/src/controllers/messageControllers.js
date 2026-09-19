const { Message } = require("../DB_config");

exports.getAllMessages = async () => {
  try {
    const messages = await Message.findAll({
      order: [["createdAt", "ASC"]],
    });

    return messages;
  } catch (error) {
    console.error("Error al obtener todos los mensajes:", error);
    throw error;
  }
};

exports.getMessages = async (chatId) => {
  try {
    const messages = await Message.findAll({
      where: {
        chatId,
      },
      order: [["createdAt", "ASC"]],
    });

    return messages;
  } catch (error) {
    console.error("Error al obtener mensajes del chat:", error);
    throw error;
  }
};

exports.createMessage = async (chatId, userId, content) => {
  try {
    const newMessage = await Message.create({
      chatId,
      userId,
      content,
    });

    return newMessage;
  } catch (error) {
    console.error("Error al guardar el mensaje:", error);
    throw error;
  }
};


const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const config = require("./config/dotenv");

function createConnection(connectionUrl = config.db.deploy) {
  let sequelize;

  if (connectionUrl) {
    // Sequelize uses pg over TCP in this long-running Node server.
    // Require encrypted connections and certificate validation explicitly.
    sequelize = new Sequelize(connectionUrl, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      native: false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: true },
      },
      pool: { max: 5, min: 0, acquire: 60000, idle: 10000 },
    });
  } else {
    if (config.isProd) {
      throw new Error("DATABASE_URL is required in production");
    }
    // 🧪 Local
    sequelize = new Sequelize(
      `postgres://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`,
      {
        logging: false,
        native: false,
      },
    );
  }

  const basename = path.basename(__filename);

  const modelDefiners = [];

  fs.readdirSync(path.join(__dirname, "/models"))
    .filter(
      (file) =>
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js",
    )
    .forEach((file) => {
      modelDefiners.push(require(path.join(__dirname, "/models", file)));
    });

  modelDefiners.forEach((model) => model(sequelize));

  let entries = Object.entries(sequelize.models);
  let capsEntries = entries.map((entry) => [
    entry[0][0].toUpperCase() + entry[0].slice(1),
    entry[1],
  ]);
  sequelize.models = Object.fromEntries(capsEntries);

  const {
    Post,
    User,
    Like,
    Matches,
    Message,
    Chat,
    Review,
    PasswordResetToken,
    AccountDeletionToken,
    Report,
    UserBlock,
  } =
    sequelize.models;

  // User - Post
  User.hasMany(Post, {
    foreignKey: "UserId",
    as: "posts",
  });

  Post.belongsTo(User, {
    foreignKey: "UserId",
    as: "owner",
  });

  // Like - Post
  Like.belongsTo(Post, {
    foreignKey: "likedPostId",
    as: "TargetPost",
  });

  Like.belongsTo(Post, {
    foreignKey: "myPostId",
    as: "MyPost",
  });

  Post.hasMany(Like, {
    foreignKey: "likedPostId",
    as: "ReceivedLikes",
  });

  // User - Chat
  Chat.belongsTo(User, {
    foreignKey: "user1Id",
    as: "user1",
  });

  Chat.belongsTo(User, {
    foreignKey: "user2Id",
    as: "user2",
  });

  User.hasMany(Chat, {
    foreignKey: "user1Id",
    as: "chatsAsUser1",
  });

  User.hasMany(Chat, {
    foreignKey: "user2Id",
    as: "chatsAsUser2",
  });

  // Chat - Message
  Chat.hasMany(Message, {
    foreignKey: "chatId",
  });

  Message.belongsTo(Chat, {
    foreignKey: "chatId",
  });

  // User - Message
  User.hasMany(Message, {
    foreignKey: "senderId",
    as: "sender",
  });

  Message.belongsTo(User, {
    foreignKey: "senderId",
  });

  // User - Review
  User.hasMany(Review, {
    foreignKey: "userId",
  });

  Review.belongsTo(User, {
    as: "reviewer",
    foreignKey: "reviewedUserId",
  });

  // User - PasswordResetToken
  User.hasMany(PasswordResetToken, {
    foreignKey: "userId",
    as: "passwordResetTokens",
  });

  PasswordResetToken.belongsTo(User, {
    foreignKey: "userId",
  });
  User.hasMany(AccountDeletionToken, { foreignKey: "userId", as: "accountDeletionTokens" });
  AccountDeletionToken.belongsTo(User, { foreignKey: "userId" });

  // Moderación y bloqueos. Estas relaciones permiten traer contexto mínimo para
  // que el panel de administración pueda revisar denuncias sin exponer datos al
  // resto de usuarios.
  User.hasMany(Report, { foreignKey: "reporterUserId", as: "reportsMade" });
  Report.belongsTo(User, { foreignKey: "reporterUserId", as: "reporter" });
  Report.belongsTo(User, { foreignKey: "targetUserId", as: "reportedUser" });
  Report.belongsTo(Post, { foreignKey: "targetPostId", as: "reportedPost" });
  User.hasMany(UserBlock, { foreignKey: "blockerUserId", as: "blocksMade" });
  UserBlock.belongsTo(User, { foreignKey: "blockedUserId", as: "blockedUser" });

  // Matches - Post
  Matches.belongsTo(Post, {
    as: "post1",
    foreignKey: "PostId1",
  });

  Matches.belongsTo(Post, {
    as: "post2",
    foreignKey: "PostId2",
  });

  Post.hasMany(Matches, {
    foreignKey: "PostId1",
  });

  Post.hasMany(Matches, {
    foreignKey: "PostId2",
  });

  return {
    ...sequelize.models,
    conn: sequelize,
    development: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: "postgres",
    },
  };
}

module.exports = { ...createConnection(), createConnection };

require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const config = require("./config/dotenv");

let sequelize;

if (config.isProd) {
  // ☁️ Producción (Render)
  sequelize = new Sequelize(config.db.deploy, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    native: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
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

const { Post, User, Like, Matches, Message, Chat, Review } = sequelize.models;

// User - Post
User.hasMany(Post);
Post.belongsTo(User);

//Like - Post
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
User.belongsToMany(Chat, {
  through: "UserChat",
});
Chat.belongsToMany(User, {
  through: "UserChat",
  foreignKey: "chatId",
});
Post.belongsTo(User, {
  as: "owner",
  foreignKey: "UserId",
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

User.hasMany(Review, {
  foreignKey: "userId",
});

Review.belongsTo(User, {
  as: "reviewer",
  foreignKey: "reviewedUserId",
});

//Matches - Post
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

module.exports = {
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

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define("EmailVerificationCode", {
    userId: { type: DataTypes.INTEGER, primaryKey: true, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
    codeHash: { type: DataTypes.STRING(64), allowNull: false },
    nonce: { type: DataTypes.STRING(32), allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    sentAt: { type: DataTypes.DATE, allowNull: false },
    windowStart: { type: DataTypes.DATE, allowNull: false },
    sendCount: { type: DataTypes.INTEGER, allowNull: false },
    attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    usedAt: { type: DataTypes.DATE, allowNull: true },
  });
};

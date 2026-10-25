const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "UserBlock",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      blockerUserId: { type: DataTypes.INTEGER, allowNull: false },
      blockedUserId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      indexes: [
        { unique: true, fields: ["blockerUserId", "blockedUserId"] },
      ],
      validate: {
        cannotBlockSelf() {
          if (Number(this.blockerUserId) === Number(this.blockedUserId)) {
            throw new Error("No puedes bloquearte a ti mismo.");
          }
        },
      },
    },
  );
};

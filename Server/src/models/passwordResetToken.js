const { DataTypes } = require("sequelize");

// Los tokens se guardan solo como hash. Así, una filtración de la base de
// datos no permite usar los enlaces de recuperación pendientes.
module.exports = (sequelize) => {
  sequelize.define(
    "PasswordResetToken",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      indexes: [
        { fields: ["tokenHash"] },
        { fields: ["expiresAt"] },
      ],
    },
  );
};

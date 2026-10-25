const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Report",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      reporterUserId: { type: DataTypes.INTEGER, allowNull: false },
      targetUserId: { type: DataTypes.INTEGER, allowNull: true },
      targetPostId: { type: DataTypes.INTEGER, allowNull: true },
      reason: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        validate: { notEmpty: true, len: [3, 1000] },
      },
      status: {
        type: DataTypes.ENUM("open", "reviewing", "resolved", "dismissed"),
        allowNull: false,
        defaultValue: "open",
      },
      resolutionNote: { type: DataTypes.STRING(1000), allowNull: true },
      resolvedByUserId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      indexes: [
        { fields: ["status", "createdAt"] },
        { unique: true, fields: ["reporterUserId", "targetUserId"] },
        { unique: true, fields: ["reporterUserId", "targetPostId"] },
      ],
      validate: {
        hasExactlyOneTarget() {
          if (Boolean(this.targetUserId) === Boolean(this.targetPostId)) {
            throw new Error("El reporte debe referirse a un usuario o a una publicación.");
          }
        },
      },
    },
  );
};

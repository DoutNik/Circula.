const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reviewedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(80),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 80],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 500],
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1,
          max: 5,
        },
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["userId", "reviewedUserId"],
        },
      ],
      validate: {
        cannotReviewSelf() {
          if (Number(this.userId) === Number(this.reviewedUserId)) {
            throw new Error("No puedes calificarte a ti mismo.");
          }
        },
      },
    },
  );
};
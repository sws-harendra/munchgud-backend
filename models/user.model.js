"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Address, { foreignKey: "userId", as: "addresses" });

      // define association here
    }
  }
  User.init(
    {
      fullname: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,   // ✅ MUST ADD
      },
      password: DataTypes.STRING,

      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      phoneNumber: { type: DataTypes.BIGINT, allowNull: true },
      secondaryNumber: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      role: { type: DataTypes.STRING, defaultValue: "user" },
      avatar: { type: DataTypes.STRING, allowNull: true },
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
    },
  );
  return User;
};

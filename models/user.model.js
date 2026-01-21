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
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      phoneNumber: { type: DataTypes.BIGINT, allowNull: true },
      secondaryNumber: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      role: { type: DataTypes.STRING, defaultValue: "user" },
      avatar: { type: DataTypes.STRING, allowNull: false },
      createdAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};

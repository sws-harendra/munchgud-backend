"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }

  Address.init(
    {
      country: DataTypes.STRING,
      city: DataTypes.STRING,
      address1: DataTypes.STRING,
      address2: DataTypes.STRING,
      zipCode: DataTypes.STRING,
      addressType: DataTypes.STRING,
      landmark: DataTypes.STRING,
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // false = active, true = deleted
      },
    },
    {
      sequelize,
      modelName: "Address",
    },
  );

  return Address;
};

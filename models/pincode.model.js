"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Pincode extends Model {
    static associate(models) {
      
    }
  }

  Pincode.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // true = delivery available
      },

      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // false = active, true = deleted
      },
    },
    {
      sequelize,
      modelName: "Pincode",
    },
  );

  return Pincode;
};

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceArea extends Model {
    static associate(models) {}
  }

  ServiceArea.init(
    {
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    
    },
    {
      sequelize,
      modelName: "ServiceArea",
      tableName: "ServiceAreas",
      timestamps: true, // ✅ createdAt & updatedAt automatic
    }
  );

  return ServiceArea;
};

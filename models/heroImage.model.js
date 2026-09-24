"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HeroImage extends Model {
    static associate(models) {
      // Define associations if needed in future
    }
  }

  HeroImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subtitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mobileImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#flagship-series",
      },
      ctaText: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altText: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "HeroImage",
      tableName: "HeroImages",
      timestamps: true,
    }
  );

  return HeroImage;
};

"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TrendingImage extends Model {
    static associate(models) {
      // Optional link to catalog Product
      if (models.Product) {
        TrendingImage.belongsTo(models.Product, {
          foreignKey: "productId",
          as: "product",
          onDelete: "SET NULL",
        });
      }
    }
  }

  TrendingImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      badge: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "🔥 Bestseller",
      },
      badgeBg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "bg-neutral-950 text-white",
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      featureBar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Signature Sound",
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 4.8,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1999,
      },
      originalPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 4999,
      },
      discount: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "60% off",
      },
      colors: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '["#FFFFFF", "#D4AF37", "#1A1A1A"]',
      },
      extraColorsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "#bestsellers",
      },
      productId: {
        type: DataTypes.INTEGER,
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
      modelName: "TrendingImage",
      tableName: "TrendingImages",
      timestamps: true,
    }
  );

  return TrendingImage;
};

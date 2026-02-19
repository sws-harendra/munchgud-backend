"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Category, {
        foreignKey: "parentId",
        as: "subcategories",
      });

      Category.belongsTo(models.Category, {
        foreignKey: "parentId",
        as: "parent",
      });

      // A category can have many products
      Category.hasMany(models.Product, {
        foreignKey: "categoryId",
        as: "products",
      });
    }
  }

  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Each category name must be unique
      },
      description: {
        type: DataTypes.TEXT,
      },

      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
    }
  );

  return Category;
};

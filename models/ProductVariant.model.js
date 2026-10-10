"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
      
      // Many-to-many with VariantOption
      ProductVariant.belongsToMany(models.VariantOption, {
        through: models.ProductVariantOption,
        foreignKey: "variantId",
        otherKey: "optionId",
        as: "options",
      });
      
      // Direct association with junction table for easier querying
      ProductVariant.hasMany(models.ProductVariantOption, {
        foreignKey: "variantId",
        as: "variantOptions"
      });
    }
  }

  ProductVariant.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "products", key: "id" },
      },
      sku: { type: DataTypes.STRING, allowNull: true, unique: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      originalPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      image: { type: DataTypes.STRING, allowNull: true },
      images: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { sequelize, modelName: "ProductVariant", tableName: "product_variants" }
  );

  return ProductVariant;
};
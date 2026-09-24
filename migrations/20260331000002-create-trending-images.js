"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TrendingImages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      badge: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "🔥 Bestseller",
      },
      badgeBg: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "bg-neutral-950 text-white",
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      featureBar: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "Signature Sound",
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 4.8,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1999,
      },
      originalPrice: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 4999,
      },
      discount: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "60% off",
      },
      colors: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '["#FFFFFF", "#D4AF37", "#1A1A1A"]',
      },
      extraColorsCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "#bestsellers",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("TrendingImages", ["isActive", "displayOrder"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TrendingImages");
  },
};

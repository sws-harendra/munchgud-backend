"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("HeroImages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subtitle: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mobileImageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "#flagship-series",
      },
      ctaText: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      altText: {
        type: Sequelize.STRING,
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

    // Add indexes for efficient querying and ordering
    await queryInterface.addIndex("HeroImages", ["isActive", "displayOrder"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("HeroImages");
  },
};

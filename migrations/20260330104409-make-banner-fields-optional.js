"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Banners", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Banners", "categoryId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn("Banners", "imageUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // optional rollback
  },
};
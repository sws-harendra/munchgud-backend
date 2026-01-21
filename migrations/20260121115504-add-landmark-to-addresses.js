"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Addresses", "landmark", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "addressType", // optional (MySQL only)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Addresses", "landmark");
  },
};

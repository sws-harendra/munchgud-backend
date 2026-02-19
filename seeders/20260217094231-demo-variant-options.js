"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("VariantOptions", [
      {
        id: 1,
        name: "Red",
        categoryId: 1, // Color
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Blue",
        categoryId: 1, // Color
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Large",
        categoryId: 2, // Size
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "Small",
        categoryId: 2, // Size
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("VariantOptions", null, {});
  },
};

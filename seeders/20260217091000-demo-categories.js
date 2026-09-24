"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const [existing] = await queryInterface.sequelize.query(
      "SELECT id FROM Categories WHERE id = 1 LIMIT 1;"
    );

    if (existing.length === 0) {
      await queryInterface.bulkInsert("Categories", [
        {
          id: 1,
          name: "Paintings",
          image: "paintings.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Categories", null, {});
  },
};

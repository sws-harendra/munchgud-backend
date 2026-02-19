"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Products", [
      {
        name: "Sunset Painting",
        description: "Beautiful handmade sunset artwork",
        categoryId: 1,
        originalPrice: 2000,
        discountPrice: 1500,
        stock: 10,
        tags: JSON.stringify(["sunset", "nature"]),
        images: JSON.stringify(["painting1.jpg"]),
        trending_product: true,
        paymentMethods: "both",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Abstract Art",
        description: "Modern abstract wall painting",
        categoryId: 1,
        originalPrice: 3000,
        discountPrice: 2500,
        stock: 5,
        tags: JSON.stringify(["abstract", "modern"]),
        images: JSON.stringify(["painting2.jpg"]),
        trending_product: false,
        paymentMethods: "online",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Products", null, {});
  },
};

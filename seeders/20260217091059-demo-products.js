"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ensure at least one category exists to satisfy foreign key constraint
    let categoryId = 1;
    const [categories] = await queryInterface.sequelize.query(
      "SELECT id FROM Categories LIMIT 1;"
    );

    if (!categories || categories.length === 0) {
      await queryInterface.bulkInsert("Categories", [
        {
          id: 1,
          name: "Paintings",
          image: "paintings.jpg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      categoryId = 1;
    } else {
      categoryId = categories[0].id;
    }

    // 2. Insert demo products if not already present
    const [existingProducts] = await queryInterface.sequelize.query(
      "SELECT id FROM Products LIMIT 1;"
    );

    if (!existingProducts || existingProducts.length === 0) {
      await queryInterface.bulkInsert("Products", [
        {
          name: "Sunset Painting",
          description: "Beautiful handmade sunset artwork",
          categoryId: categoryId,
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
          categoryId: categoryId,
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
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Products", null, {});
  },
};

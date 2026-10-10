"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("product_variants");

    if (!tableInfo.images) {
      await queryInterface.addColumn("product_variants", "images", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!tableInfo.originalPrice) {
      await queryInterface.addColumn("product_variants", "originalPrice", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("product_variants");

    if (tableInfo.images) {
      await queryInterface.removeColumn("product_variants", "images");
    }

    if (tableInfo.originalPrice) {
      await queryInterface.removeColumn("product_variants", "originalPrice");
    }
  },
};

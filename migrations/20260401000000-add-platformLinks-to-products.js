"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Products");
    if (!tableInfo.platformLinks) {
      await queryInterface.addColumn("Products", "platformLinks", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Products");
    if (tableInfo.platformLinks) {
      await queryInterface.removeColumn("Products", "platformLinks");
    }
  },
};

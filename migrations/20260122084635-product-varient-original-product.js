"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "varientValue", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "piece",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "varientValue");
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "driverId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users", // or Drivers table if you have one
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "driverId");
  },
};

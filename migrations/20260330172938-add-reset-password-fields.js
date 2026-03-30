"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "resetPasswordToken", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("users", "resetPasswordExpire", {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "resetPasswordToken");
    await queryInterface.removeColumn("users", "resetPasswordExpire");
  },
};
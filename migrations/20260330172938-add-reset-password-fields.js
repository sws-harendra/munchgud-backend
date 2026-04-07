"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("Users");

    if (!table.resetPasswordToken) {
      await queryInterface.addColumn("Users", "resetPasswordToken", {
        type: Sequelize.STRING,
      });
    }

    if (!table.resetPasswordExpire) {
      await queryInterface.addColumn("Users", "resetPasswordExpire", {
        type: Sequelize.DATE,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "resetPasswordToken");
    await queryInterface.removeColumn("Users", "resetPasswordExpire");
  },
};
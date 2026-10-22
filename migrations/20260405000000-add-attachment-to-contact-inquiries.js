"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface
      .describeTable("ContactInquiries")
      .catch(() => null);

    if (tableInfo && !tableInfo.attachment) {
      await queryInterface.addColumn("ContactInquiries", "attachment", {
        type: Sequelize.STRING,
        allowNull: true,
        after: "adminNotes",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface
      .describeTable("ContactInquiries")
      .catch(() => null);

    if (tableInfo && tableInfo.attachment) {
      await queryInterface.removeColumn("ContactInquiries", "attachment");
    }
  },
};

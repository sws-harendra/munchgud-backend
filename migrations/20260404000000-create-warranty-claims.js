"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("WarrantyClaims", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      claimId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      serialNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      orderId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      productModel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      claimType: {
        type: Sequelize.ENUM("registration", "claim", "replacement"),
        allowNull: false,
        defaultValue: "registration",
      },
      issueDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      purchaseDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      warrantyStartDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      warrantyEndDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("approved", "pending", "in_review", "rejected", "resolved"),
        allowNull: false,
        defaultValue: "approved",
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "support_warranty",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("WarrantyClaims");
  },
};

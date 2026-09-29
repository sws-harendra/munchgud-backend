"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Make email optional (allowNull: true) in Users table
    await queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // 2. Create OtpVerifications table
    await queryInterface.createTable("OtpVerifications", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      otp: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      otpExpiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      registrationData: {
        type: Sequelize.TEXT("long"),
        allowNull: true,
      },
      purpose: {
        type: Sequelize.STRING(50),
        defaultValue: "register",
        allowNull: false,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // 3. Add index on phoneNumber for fast lookup
    await queryInterface.addIndex("OtpVerifications", ["phoneNumber"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OtpVerifications");
    await queryInterface.changeColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },
};

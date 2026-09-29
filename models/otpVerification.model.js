"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OtpVerification extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  OtpVerification.init(
    {
      phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      registrationData: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      purpose: {
        type: DataTypes.STRING(50),
        defaultValue: "register",
        allowNull: false,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OtpVerification",
      tableName: "OtpVerifications",
      timestamps: true,
    }
  );

  return OtpVerification;
};

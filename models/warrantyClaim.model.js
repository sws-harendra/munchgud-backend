"use strict";

module.exports = (sequelize, DataTypes) => {
  const WarrantyClaim = sequelize.define(
    "WarrantyClaim",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      claimId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      productModel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      claimType: {
        type: DataTypes.ENUM("registration", "claim", "replacement"),
        allowNull: false,
        defaultValue: "registration", // 'registration' | 'claim' | 'replacement'
      },
      issueDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      warrantyStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      warrantyEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("approved", "pending", "in_review", "rejected", "resolved"),
        allowNull: false,
        defaultValue: "approved", // 'approved' (active) | 'pending' | 'in_review' | 'rejected' | 'resolved'
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "support_warranty",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "WarrantyClaims",
      timestamps: true,
    }
  );

  WarrantyClaim.associate = function (models) {
    if (models.User) {
      WarrantyClaim.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  };

  // Auto-sync table if not exists so it works seamlessly without breaking
  WarrantyClaim.sync({ alter: false }).catch(() => {
    // In case DB connection is established later
  });

  return WarrantyClaim;
};

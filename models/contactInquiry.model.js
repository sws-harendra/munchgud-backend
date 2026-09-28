"use strict";

module.exports = (sequelize, DataTypes) => {
  const ContactInquiry = sequelize.define(
    "ContactInquiry",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      orderId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "Customer Support",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "contact_form", // 'contact_form' | 'live_concierge' | 'support_warranty'
      },
      status: {
        type: DataTypes.ENUM("new", "in_progress", "resolved", "closed"),
        defaultValue: "new",
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
      tableName: "ContactInquiries",
      timestamps: true,
    }
  );

  ContactInquiry.associate = function (models) {
    if (models.User) {
      ContactInquiry.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  };

  // Auto-sync table if not exists so it works seamlessly without breaking
  ContactInquiry.sync({ alter: false }).catch(() => {
    // In case DB connection is established later
  });

  return ContactInquiry;
};

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // 🔗 Relations
      Order.belongsTo(models.User, { foreignKey: "userId" });
      Order.belongsTo(models.Address, { foreignKey: "addressId" });
      Order.hasMany(models.OrderItem, { foreignKey: "orderId" });
      Order.hasOne(models.OrderAddress, {
        foreignKey: "orderId",
      });
      Order.belongsTo(models.User, {
  foreignKey: "driverId",
  as: "driver",
});

      Order.hasMany(models.Payment, { foreignKey: "orderId" });
    }
  }

  Order.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      driverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      addressId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled"
        ),
        defaultValue: "pending",
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },
      paymentMethod: {
        type: DataTypes.ENUM("cod", "online", "card", "upi", "wallet"),
        defaultValue: "cod",
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "Orders",
    }
  );

  return Order;
};

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Review extends Model {
        static associate(models) {
            // review user pr belong h 
            this.belongsTo(models.User, {
                foreignKey: "userId",
                as: "user",
            } );

            //Review belongs to product
            this.belongsTo(models.Product,{
                foreignKey: "productId",
                as:"product",
            });
        }
    }

     Review.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },

      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "reviews",
    },
  );

  return Review;
};

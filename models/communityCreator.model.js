"use strict";

module.exports = (sequelize, DataTypes) => {
  const CommunityCreator = sequelize.define(
    "CommunityCreator",
    {
      handle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      tableName: "CommunityCreators",
      timestamps: true,
    }
  );

  return CommunityCreator;
};

"use strict";

module.exports = (sequelize, DataTypes) => {
  const CommunityContributor = sequelize.define(
    "CommunityContributor",
    {
      rank: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      points: {
        type: DataTypes.STRING,
        defaultValue: "0 points",
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "Community Member",
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      badgeClass: {
        type: DataTypes.STRING,
        defaultValue: "star",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      tableName: "CommunityContributors",
      timestamps: true,
    }
  );

  return CommunityContributor;
};

"use strict";

module.exports = (sequelize, DataTypes) => {
  const CommunityTopic = sequelize.define(
    "CommunityTopic",
    {
      topicId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      desc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING,
        defaultValue: "Headphones",
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
      tableName: "CommunityTopics",
      timestamps: true,
    }
  );

  return CommunityTopic;
};

"use strict";

module.exports = (sequelize, DataTypes) => {
  const CommunityDiscussion = sequelize.define(
    "CommunityDiscussion",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      desc: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Community Member",
      },
      authorAvatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "General",
      },
      tag: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "general",
      },
      votes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      comments: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      views: {
        type: DataTypes.STRING,
        defaultValue: "0",
      },
      time: {
        type: DataTypes.STRING,
        defaultValue: "Just now",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "CommunityDiscussions",
      timestamps: true,
    }
  );

  return CommunityDiscussion;
};

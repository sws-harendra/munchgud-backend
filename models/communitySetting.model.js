"use strict";

module.exports = (sequelize, DataTypes) => {
  const CommunitySetting = sequelize.define(
    "CommunitySetting",
    {
      heroTag: {
        type: DataTypes.STRING,
        defaultValue: "// FLAZO COMMUNITY",
      },
      heroTitle: {
        type: DataTypes.STRING,
        defaultValue: "Not Just Listeners. A Community That Feels.",
      },
      heroSubtitle: {
        type: DataTypes.TEXT,
        defaultValue:
          "Connect. Share. Learn. Create. Grow. Because better sound brings better people together.",
      },
      heroImage: {
        type: DataTypes.STRING,
        defaultValue: "/images/flazo_community_hero_hq.jpg",
      },
      membersCount: {
        type: DataTypes.STRING,
        defaultValue: "25K+",
      },
      discussionsCount: {
        type: DataTypes.STRING,
        defaultValue: "10K+",
      },
      answersCount: {
        type: DataTypes.STRING,
        defaultValue: "500+",
      },
      expertsCount: {
        type: DataTypes.STRING,
        defaultValue: "50+",
      },
      memberQuote: {
        type: DataTypes.TEXT,
        defaultValue:
          "Flazo community feels like a family. It's amazing to see real people talking, helping and vibing over something we all love — music.",
      },
      quoteAuthor: {
        type: DataTypes.STRING,
        defaultValue: "Neha P., Community Member",
      },
      watchStoryText: {
        type: DataTypes.STRING,
        defaultValue: "Watch Our Story",
      },
      watchStoryUrl: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      joinButtonText: {
        type: DataTypes.STRING,
        defaultValue: "Join the Community",
      },
      pillarsText: {
        type: DataTypes.STRING,
        defaultValue: "MUSIC,PEOPLE,IDEAS,IMPACT",
      },
      ideaCardTitle: {
        type: DataTypes.STRING,
        defaultValue: "Your Ideas Shape the Next Sound",
      },
      ideaCardSubtitle: {
        type: DataTypes.TEXT,
        defaultValue:
          "Share feedback, suggest features, and be a part of what we build next.",
      },
      ideaCardButtonText: {
        type: DataTypes.STRING,
        defaultValue: "Share Your Idea",
      },
      missionCardTitle: {
        type: DataTypes.STRING,
        defaultValue: "A Stronger Community. A Brighter India.",
      },
      missionCardSubtitle: {
        type: DataTypes.TEXT,
        defaultValue: "Sound that empowers the creators of tomorrow.",
      },
      missionCardBadge: {
        type: DataTypes.STRING,
        defaultValue: "Made for Sound",
      },
    },
    {
      tableName: "CommunitySettings",
      timestamps: true,
    }
  );

  return CommunitySetting;
};

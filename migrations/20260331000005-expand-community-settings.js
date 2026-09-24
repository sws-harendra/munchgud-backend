"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("CommunitySettings");

    const columnsToAdd = [
      { name: "watchStoryText", type: Sequelize.STRING, defaultValue: "Watch Our Story" },
      { name: "watchStoryUrl", type: Sequelize.STRING, defaultValue: "" },
      { name: "joinButtonText", type: Sequelize.STRING, defaultValue: "Join the Community" },
      { name: "pillarsText", type: Sequelize.STRING, defaultValue: "MUSIC,PEOPLE,IDEAS,IMPACT" },
      { name: "ideaCardTitle", type: Sequelize.STRING, defaultValue: "Your Ideas Shape the Next Sound" },
      { name: "ideaCardSubtitle", type: Sequelize.TEXT, defaultValue: "Share feedback, suggest features, and be a part of what we build next." },
      { name: "ideaCardButtonText", type: Sequelize.STRING, defaultValue: "Share Your Idea" },
      { name: "missionCardTitle", type: Sequelize.STRING, defaultValue: "A Stronger Community. A Brighter India." },
      { name: "missionCardSubtitle", type: Sequelize.TEXT, defaultValue: "Sound that empowers the creators of tomorrow." },
      { name: "missionCardBadge", type: Sequelize.STRING, defaultValue: "Made for Sound" },
    ];

    for (const col of columnsToAdd) {
      if (!tableInfo[col.name]) {
        await queryInterface.addColumn("CommunitySettings", col.name, {
          type: col.type,
          defaultValue: col.defaultValue,
          allowNull: true,
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const cols = [
      "watchStoryText",
      "watchStoryUrl",
      "joinButtonText",
      "pillarsText",
      "ideaCardTitle",
      "ideaCardSubtitle",
      "ideaCardButtonText",
      "missionCardTitle",
      "missionCardSubtitle",
      "missionCardBadge",
    ];
    for (const col of cols) {
      try {
        await queryInterface.removeColumn("CommunitySettings", col);
      } catch (err) {}
    }
  },
};

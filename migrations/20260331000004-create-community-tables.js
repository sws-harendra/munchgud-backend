"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. CommunityDiscussions
    await queryInterface.createTable("CommunityDiscussions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      desc: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      author: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Community Member",
      },
      authorAvatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "General",
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "general",
      },
      votes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      comments: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      views: {
        type: Sequelize.STRING,
        defaultValue: "0",
      },
      time: {
        type: Sequelize.STRING,
        defaultValue: "Just now",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      isPinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 2. CommunityCreators
    await queryInterface.createTable("CommunityCreators", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      handle: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 3. CommunityContributors
    await queryInterface.createTable("CommunityContributors", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      rank: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      points: {
        type: Sequelize.STRING,
        defaultValue: "0 points",
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: "Community Member",
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      badgeClass: {
        type: Sequelize.STRING,
        defaultValue: "star",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 4. CommunitySettings
    await queryInterface.createTable("CommunitySettings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      heroTag: {
        type: Sequelize.STRING,
        defaultValue: "// FLAZO COMMUNITY",
      },
      heroTitle: {
        type: Sequelize.STRING,
        defaultValue: "Not Just Listeners. A Community That Feels.",
      },
      heroSubtitle: {
        type: Sequelize.TEXT,
        defaultValue:
          "Connect. Share. Learn. Create. Grow. Because better sound brings better people together.",
      },
      heroImage: {
        type: Sequelize.STRING,
        defaultValue: "/images/flazo_community_hero_hq.jpg",
      },
      membersCount: {
        type: Sequelize.STRING,
        defaultValue: "25K+",
      },
      discussionsCount: {
        type: Sequelize.STRING,
        defaultValue: "10K+",
      },
      answersCount: {
        type: Sequelize.STRING,
        defaultValue: "500+",
      },
      expertsCount: {
        type: Sequelize.STRING,
        defaultValue: "50+",
      },
      memberQuote: {
        type: Sequelize.TEXT,
        defaultValue:
          "Flazo community feels like a family. It's amazing to see real people talking, helping and vibing over something we all love — music.",
      },
      quoteAuthor: {
        type: Sequelize.STRING,
        defaultValue: "Neha P., Community Member",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 5. CommunityTopics
    await queryInterface.createTable("CommunityTopics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      topicId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      desc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      icon: {
        type: Sequelize.STRING,
        defaultValue: "Headphones",
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("CommunityTopics");
    await queryInterface.dropTable("CommunitySettings");
    await queryInterface.dropTable("CommunityContributors");
    await queryInterface.dropTable("CommunityCreators");
    await queryInterface.dropTable("CommunityDiscussions");
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Blogs");

    if (!tableInfo.category) {
      await queryInterface.addColumn("Blogs", "category", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "Product Guides",
      });
    }

    if (!tableInfo.isFeatured) {
      await queryInterface.addColumn("Blogs", "isFeatured", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!tableInfo.isTrending) {
      await queryInterface.addColumn("Blogs", "isTrending", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!tableInfo.readTime) {
      await queryInterface.addColumn("Blogs", "readTime", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "5 min read",
      });
    }

    if (!tableInfo.views) {
      await queryInterface.addColumn("Blogs", "views", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableInfo.authorName) {
      await queryInterface.addColumn("Blogs", "authorName", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "Team Flazo",
      });
    }

    if (!tableInfo.tags) {
      await queryInterface.addColumn("Blogs", "tags", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: "[]",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Blogs", "category");
    await queryInterface.removeColumn("Blogs", "isFeatured");
    await queryInterface.removeColumn("Blogs", "isTrending");
    await queryInterface.removeColumn("Blogs", "readTime");
    await queryInterface.removeColumn("Blogs", "views");
    await queryInterface.removeColumn("Blogs", "authorName");
    await queryInterface.removeColumn("Blogs", "tags");
  },
};

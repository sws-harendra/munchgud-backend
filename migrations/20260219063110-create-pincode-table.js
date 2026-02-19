module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Pincodes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING,
      },

      state: {
        type: Sequelize.STRING,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Pincodes");
  },
};

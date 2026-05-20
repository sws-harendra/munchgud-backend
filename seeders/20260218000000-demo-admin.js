"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash the admin password (change 'admin123' to your desired password)
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Check if the admin user already exists to prevent duplicate key errors
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email = 'admin@munchgud.com' LIMIT 1;`
    );

    if (existingUsers.length === 0) {
      await queryInterface.bulkInsert("Users", [
        {
          fullname: "MunchGud Admin",
          email: "admin@munchgud.com",
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log("Admin user seeded successfully!");
    } else {
      console.log("Admin user with email 'admin@munchgud.com' already exists, skipping seeding.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", { email: "admin@munchgud.com" }, {});
  },
};

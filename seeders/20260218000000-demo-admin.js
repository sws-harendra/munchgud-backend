"use strict";
require("dotenv").config();
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@munchgud.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "MunchGud Admin";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if the admin user already exists
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email = '${adminEmail.replace(/'/g, "''")}' LIMIT 1;`
    );

    if (existingUsers.length === 0) {
      await queryInterface.bulkInsert("Users", [
        {
          fullname: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      console.log(`Admin user (${adminEmail}) seeded successfully!`);
    } else {
      await queryInterface.bulkUpdate(
        "Users",
        {
          password: hashedPassword,
          role: "admin",
          updatedAt: new Date(),
        },
        { email: adminEmail }
      );
      console.log(`Admin user (${adminEmail}) exists. Password & admin role verified!`);
    }
  },

  async down(queryInterface, Sequelize) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@munchgud.com";
    await queryInterface.bulkDelete("Users", { email: adminEmail }, {});
  },
};


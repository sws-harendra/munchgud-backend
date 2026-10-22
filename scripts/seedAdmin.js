/**
 * Independent Admin Seeder Script
 * Run this directly using: npm run seed:admin  OR  node scripts/seedAdmin.js
 * 
 * Safe for Production:
 * - Only creates or updates the single Admin account
 * - Never deletes or modifies any other tables (orders, products, users, categories, etc.)
 */
require("dotenv").config();
const { User, sequelize } = require("../models");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    const adminEmail = process.env.ADMIN_EMAIL || "admin@munchgud.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "MunchGud Admin";

    console.log(`Checking for admin user with email '${adminEmail}'...`);
    const existing = await User.findOne({ where: { email: adminEmail } });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      console.log(`Admin user '${adminEmail}' found (ID: ${existing.id}). Updating password and ensuring role='admin'...`);
      existing.password = hashedPassword;
      existing.role = "admin";
      if (!existing.fullname) {
        existing.fullname = adminName;
      }
      await existing.save();

      console.log("=========================================");
      console.log("  ADMIN CREDENTIALS UPDATED SAFELY! 🎉");
      console.log("=========================================");
      console.log(`  Name:     ${existing.fullname}`);
      console.log(`  Email:    ${existing.email}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`  Role:     ${existing.role}`);
      console.log("=========================================");
      console.log("✅ All other tables and existing data are completely safe and untouched.");
      process.exit(0);
    }

    console.log("Creating new admin user in database...");
    const admin = await User.create({
      fullname: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("=========================================");
    console.log("  ADMIN USER SEEDED SUCCESSFULLY! 🎉");
    console.log("=========================================");
    console.log(`  Name:     ${admin.fullname}`);
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role:     ${admin.role}`);
    console.log("=========================================");
    console.log("✅ All other tables and existing data are completely safe and untouched.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();

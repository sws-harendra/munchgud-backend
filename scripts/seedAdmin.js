/**
 * Independent Admin Seeder Script
 * Run this directly using: node scripts/seedAdmin.js
 */
require("dotenv").config();
const { User } = require("../models");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    const adminEmail = "admin@munchgud.com";
    const adminPassword = "admin123";

    console.log("Checking for existing admin user...");
    const existing = await User.findOne({ where: { email: adminEmail } });

    if (existing) {
      console.log(`Admin user with email '${adminEmail}' already exists! Role: ${existing.role}`);
      process.exit(0);
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log("Creating admin user in database...");
    const admin = await User.create({
      fullname: "MunchGud Admin",
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
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "munchgud_db",
  process.env.DB_USER || "munchgud_user",
  process.env.DB_PASS || "munchgud_password",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    timezone: "+05:30",
    logging: false,
  }
);

// ✅ async connect check
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected successfully");
  } catch (err) {
    console.log("❌ DB connection error:", err);
  }
})();

// ✅ VERY IMPORTANT
module.exports = sequelize;
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
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
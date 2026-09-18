require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "munchgud_user",
    password: process.env.DB_PASS || "munchgud_password",
    database: process.env.DB_NAME || "munchgud_db",
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
  },
  test: {
    username: process.env.DB_USER || "munchgud_user",
    password: process.env.DB_PASS || "munchgud_password",
    database: process.env.DB_NAME_TEST || "munchgud_db_test",
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
  },
  production: {
    username: process.env.DB_USER || "munchgud_user",
    password: process.env.DB_PASS || "munchgud_password",
    database: process.env.DB_NAME_PROD || process.env.DB_NAME || "munchgud_db",
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
  },
};
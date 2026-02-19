const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql",
    timezone: "+05:30",
    logging: false, // 👈 disables console SQL logs

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);
try {
  sequelize.authenticate();
  console.log("==connected db successfully==");
} catch (err) {
  console.log(err);
}

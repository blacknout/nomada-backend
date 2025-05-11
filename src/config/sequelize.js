const { Sequelize, ValidationErrorItem } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

console.log("Environment:", process.env.NODE_ENV);
console.log("Database URL:", process.env.DATABASE_URL);

const dbUrl = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is missing in .env file.");
}

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    // SSL options (uncomment if needed for SSL connection)
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false,
    // },
  },
});

module.exports = sequelize;
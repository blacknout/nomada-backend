import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

console.log("**********-----------************")
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASS!, {
  host: process.env.DB_HOST || "db1tsttosee",
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
  logging: false,
});

export default sequelize;

import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASS!, {
//   host: process.env.DB_HOST || "db",
//   port: Number(process.env.DB_PORT) || 5432,
//   dialect: "postgres",
//   logging: false,
// });
console.log("---------------------**************----------------------");

console.log("🚀 DATABASE_URL:", process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

export default sequelize;

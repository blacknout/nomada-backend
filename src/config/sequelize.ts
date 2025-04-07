import { Sequelize, ValidationErrorItem } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

const dbUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;
   
const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  dialectOptions: {
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false,
    // },
  },
  logging: false,
});

export interface SequelizeError {
  name: string;
  message: string;
  errors: ValidationErrorItem[];
}

export default sequelize;

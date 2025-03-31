import { Sequelize, ValidationErrorItem } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
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
  name: string; // Error name (e.g., "SequelizeValidationError")
  message: string; // Main error message
  errors: ValidationErrorItem[]; // Array of validation errors
}

export default sequelize;

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
  name: string;
  message: string;
  errors: ValidationErrorItem[];
}

export default sequelize;

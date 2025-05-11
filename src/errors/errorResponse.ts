import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import { Sequelize, ValidationErrorItem } from "sequelize";

export interface SequelizeError {
  name: string;
  message: string;
  errors: ValidationErrorItem[];
}

const errorResponse = (res: Response, err: any) => {
  if (err instanceof ValidationError) {
    const sequelizeError: SequelizeError = err;
    res.status(500).json({ error: sequelizeError.errors});
    return;
  } else {
    res.status(500).json({ error: err });
    return;
  }
}

export default errorResponse;
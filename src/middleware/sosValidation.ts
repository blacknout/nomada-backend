import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, query, check, validationResult } from "express-validator";
import logger from "../utils/logger";

export const validateSosInputs: RequestHandler[] = [
  query("id")
  .isUUID()
  .withMessage("Invalid UUID format for ID")
  .optional(),

  check("isActivated")
    .isBoolean()
    .withMessage('Activated must be a boolean value.')
    .optional(),

  check("contactId")
    .isUUID()
    .withMessage("Invalid UUID format for Contact ID")
    .optional(),

  check("contactName")
    .isLength({ min: 2 })
    .withMessage("The contact name cannot be blank.")
    .optional(),

  check("email")
    .isEmail()
    .withMessage("Invalid email format.")
    .optional(),

  check("phone")
    .isLength({ min: 7 })
    .withMessage("This is not a valid Phone number.")
    .matches(/\d/)
    .withMessage("This is not a valid phone number.")
    .optional(),

  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

export const validateContactSosInputs: RequestHandler[] = [
  query("userId")
  .isUUID()
  .withMessage("Invalid UUID format for ID")
  .optional(),

  check("currentRide")
    .isUUID()
    .withMessage("Invalid UUID format for Ride ID")
    .optional(),

  check("location")
  .isObject()
  .withMessage("Location must be an object")
  .custom((value) => {
    if (!value.latitude || !value.longitude) {
      throw new Error("Start location must have latitude and longitude");
    }
    if (typeof value.latitude !== "number" || typeof value.longitude !== "number") {
      throw new Error("latitude and longitude must be numbers");
    }
    if (value.latitude < -90 || value.latitude > 90) {
      throw new Error("latitude must be between -90 and 90");
    }
    if (value.longitude < -180 || value.longitude > 180) {
      throw new Error("longitude must be between -180 and 180");
    }
    return true;
  }),

  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

export const validateSosQuery: RequestHandler[] = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isUUID()
    .withMessage("ID must be a valid UUID"),

  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];
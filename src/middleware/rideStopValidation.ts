import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, validationResult } from "express-validator";

export const validateCreateRideStop: RequestHandler[] = [
  param("rideId")
    .isUUID()
    .withMessage("Ride ID must be a valid UUID"),

  check("reason")
    .isString()
    .withMessage("Reason must be a string")
    .isIn(["safe", "accident", "mechanical"])
    .withMessage("Reason must be one of: safe, accident, mechanical"),

  check("location")
    .isObject()
    .withMessage("Location must be an object")
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error("Location must have latitude and longitude");
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
      return
    }
    next();
  }) as RequestHandler,
];

export const validateRideStopInfo: RequestHandler[] = [
  param("stopId")
    .notEmpty()
    .isUUID()
    .withMessage("Stop ID must be a valid UUID"),

  check("reason")
    .isString()
    .withMessage("Reason must be a string")
    .isIn(["safe", "accident", "mechanical"])
    .withMessage("Reason must be one of: safe, accident, mechanical"),

  check("location")
    .isObject()
    .withMessage("Location must be an object")
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error("Location must have latitude and longitude");
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
    })
    .optional(),

  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateStopQuery: RequestHandler[] = [
  param("stopId")
    .notEmpty()
    .withMessage("Stop ID is required")
    .isUUID()
    .withMessage("Stop ID must be a valid UUID"),

  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

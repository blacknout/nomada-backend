import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, validationResult } from "express-validator";

export const validateRideInfo: RequestHandler[] = [
  check("groupId").notEmpty().isUUID().withMessage("Invalid UUID format for Group ID"),
  check("roadCaptainId").notEmpty().isUUID().withMessage("Invalid UUID format for Road Captain ID"),
  check("status").isString().withMessage("Status must be a string")
  .isIn(["pending", "ongoing", "completed"]).withMessage("Status must be one of: pending, ongoing, completed"),
  check("startLocation").isObject().withMessage("Start location must be an object")
  .custom((value) => {
    if (!value.latitude || !value.longitude) {
      throw new Error("Start location must have latitude and longitude");
    }
    if (typeof value.latitude !== "number" || typeof value.longitude !== "number") {
      throw new Error("Latitude and longitude must be numbers");
    }
    if (value.latitude < -90 || value.latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (value.longitude < -180 || value.longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
    return true;
  }),
  check("destination").isObject().withMessage("Destination must be an object")
  .custom((value) => {
    if (!value.latitude || !value.longitude) {
      throw new Error("Destination must have latitude and longitude");
    }
    if (typeof value.latitude !== "number" || typeof value.longitude !== "number") {
      throw new Error("Latitude and longitude must be numbers");
    }
    if (value.latitude < -90 || value.latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (value.longitude < -180 || value.longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
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

export const validateRideQuery: RequestHandler[] = [
  param("rideId").notEmpty().withMessage("Ride ID is required")
  .isUUID().withMessage("Ride ID must be a valid UUID"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, validationResult } from "express-validator";

export const validateCreateRideStop: RequestHandler[] = [
  param("rideId").isUUID().withMessage("Ride ID must be a valid UUID"),
  check("reason").isString().withMessage("Reason must be a string")
  .isIn(["safe", "accident", "mechanical"]).withMessage("Reason must be one of: safe, accident, mechanical"),
  check("location").isObject().withMessage("Location must be an object")
  .custom((value) => {
    if (!value.lat || !value.lng) {
      throw new Error("Location must have lat and lng");
    }
    if (typeof value.lat !== "number" || typeof value.lng !== "number") {
      throw new Error("lat and lng must be numbers");
    }
    if (value.lat < -90 || value.lat > 90) {
      throw new Error("lat must be between -90 and 90");
    }
    if (value.lng < -180 || value.lng > 180) {
      throw new Error("lng must be between -180 and 180");
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
  param("stopId").notEmpty().isUUID().withMessage("Stop ID must be a valid UUID"),
  check("reason").isString().withMessage("Reason must be a string")
  .isIn(["safe", "accident", "mechanical"]).withMessage("Reason must be one of: safe, accident, mechanical"),
  check("location").isObject().withMessage("Location must be an object")
  .custom((value) => {
    if (!value.lat || !value.lng) {
      throw new Error("Location must have lat and lng");
    }
    if (typeof value.lat !== "number" || typeof value.lng !== "number") {
      throw new Error("lat and lng must be numbers");
    }
    if (value.lat < -90 || value.lat > 90) {
      throw new Error("lat must be between -90 and 90");
    }
    if (value.lng < -180 || value.lng > 180) {
      throw new Error("lng must be between -180 and 180");
    }
    return true;
  }).optional(),
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
  param("stopId").notEmpty().withMessage("Stop ID is required")
  .isUUID().withMessage("Stop ID must be a valid UUID"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

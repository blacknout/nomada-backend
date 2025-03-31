import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, body,validationResult } from "express-validator";

export const validateRideInfo: RequestHandler[] = [
  check("groupId").notEmpty().isUUID().withMessage("Invalid UUID format for Group ID"),
  check("roadCaptainId")
  .isUUID().withMessage("Invalid UUID format for Road Captain ID")
  .optional(),
  check("status").isString().withMessage("Status must be a string")
  .isIn(["pending", "ongoing", "completed"]).withMessage("Status must be one of: pending, ongoing, completed")
  .optional(),
  check("startLocation").isObject().withMessage("Start location must be an object")
  .custom((value) => {
    if (!value.lat || !value.lng) {
      throw new Error("Start location must have lat and lng");
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
  check("destination").isObject().withMessage("Destination must be an object")
  .custom((value) => {
    if (!value.lat || !value.lng) {
      throw new Error("Destination must have lat and lng");
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

export const validateRideRoute: RequestHandler[] = [
  body("route")
  .isArray({ min: 1 }).withMessage("Route must be a non-empty array")
  .custom((value) => {
    for (const point of value) {
      if (
        typeof point.lat !== "number" ||
        point.lat < -90 || point.lat > 90
      ) {
        throw new Error("Each point must have a valid lat (-90 to 90)");
      }
      if (
        typeof point.lng !== "number" ||
        point.lng < -180 || point.lng > 180
      ) {
        throw new Error("Each point must have a valid lng (-180 to 180)");
      }
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

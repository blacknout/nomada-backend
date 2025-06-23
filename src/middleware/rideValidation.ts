import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, body,validationResult } from "express-validator";

export const createRideInfo: RequestHandler[] = [
  check("groupId")
    .notEmpty()
    .isUUID()
    .withMessage("Invalid UUID format for Group ID"),
    
  check("roadCaptainId")
    .isUUID()
    .withMessage("Invalid UUID format for Road Captain ID")
    .optional(),
  
  check("status").isString()
    .withMessage("Status must be a string")
    .isIn(["pending", "started", "completed"])
    .withMessage("Status must be one of: pending, started, completed")
    .optional(),
  
  check("startLocation")
    .isObject()
    .withMessage("Start location must be an object")
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
    })
    .optional(),

  check("destination")
    .isObject()
    .withMessage("Destination must be an object")
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error("Destination must have latitude and longitude");
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
      return;
    }
    next();
  }) as RequestHandler,
];

export const updateRideInfo: RequestHandler[] = [
  param("id")
  .notEmpty()
  .withMessage("Ride ID is required")
  .isUUID()
  .withMessage("Ride ID must be a valid UUID"),
    
  check("roadCaptainId")
    .isUUID()
    .withMessage("Invalid UUID format for Road Captain ID")
    .optional(),
  
  check("status").isString()
    .withMessage("Status must be a string")
    .isIn(["pending", "started", "completed"])
    .withMessage("Status must be one of: pending, started, completed")
    .optional(),
  
  check("startLocation")
    .isObject()
    .withMessage("Start location must be an object")
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
    })
    .optional(),

  check("destination")
    .isObject()
    .withMessage("Destination must be an object")
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error("Destination must have latitude and longitude");
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
      return;
    }
    next();
  }) as RequestHandler,
];

export const validateRideStatus: RequestHandler[] = [
  param("id")
  .notEmpty()
  .withMessage("Ride ID is required")
  .isUUID()
  .withMessage("Ride ID must be a valid UUID"),

  check("status")
  .isString()
  .withMessage("Status must be a string")
  .isIn(["pending", "started", "completed"])
  .withMessage("Status must be one of: pending, started, completed"),

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
  param("id")
    .notEmpty()
    .withMessage("Ride ID is required")
    .isUUID()
    .withMessage("Ride ID must be a valid UUID"),

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
  param("id")
  .notEmpty()
  .withMessage("Ride ID is required")
  .isUUID()
  .withMessage("Ride ID must be a valid UUID"),

  body("route")
    .isArray({ min: 1 })
    .withMessage("Route must be a non-empty array")
    .custom((value) => {
      for (const point of value) {
        if (
          typeof point.latitude !== "number" ||
          point.latitude < -90 || point.latitude > 90
        ) {
          throw new Error("Each point must have a valid latitude (-90 to 90)");
        }
        if (
          typeof point.longitude !== "number" ||
          point.longitude < -180 || point.longitude > 180
        ) {
          throw new Error("Each point must have a valid longitude (-180 to 180)");
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

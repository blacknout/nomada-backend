import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, validationResult } from "express-validator";

export const validateCreateBike: RequestHandler[] = [
  check("plate")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Plate number must be at least 3 characters.")
    .optional(),

  check("make")
    .isLength({ min: 3 })
    .withMessage("The make must be at least 3 characters."),

  check("model")
    .isLength({ min: 2 })
    .withMessage("The model name must be at least 2 characters."),

  check("year").isLength({ min: 4 })
    .withMessage("Please enter a valid year."),

  check("vin")
    .trim()
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('VIN contains invalid characters')
    .optional(),

  check('images')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Images must be an array'),

  check('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string (URL or path)'),

  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateUpdateBike: RequestHandler[] = [
  check("plate")
    .isLength({ min: 3 })
    .withMessage("Plate number must be at least 3 characters.")
    .optional(),

  check("make")
    .isLength({ min: 3 })
    .withMessage("The make must be at least 3 characters.")
    .optional(),

  check("model")
    .isLength({ min: 2 })
    .withMessage("The model name must be at least 2 characters.")
    .optional(),

  check("year")
    .isLength({ min: 4 })
    .withMessage("Please enter a valid year.")
    .optional(),

  check("vin")
    .trim()
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('VIN contains invalid characters')
    .optional(),

  check("stolen")
    .isBoolean()
    .withMessage('Stolen must be set to true or false')
    .optional(),

  check('images')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Images must be an array'),

  check('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string (URL or path)'),
    
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateBikeQuery: RequestHandler[] = [
  param("bikeId")
    .notEmpty()
    .withMessage("Bike ID is required")
    .isUUID()
    .withMessage("Bike ID must be a valid UUID"),

  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateVinQuery: RequestHandler[] = [
  check("vin")
    .trim()
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be exactly 17 characters')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/)
    .withMessage('VIN contains invalid characters'),

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

  check("location.address")
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters')
    .matches(/^[a-zA-Z0-9\s,'-]*$/)
    .withMessage('Address contains invalid characters')
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

import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, validationResult } from "express-validator";

export const validateCreateBike: RequestHandler[] = [
  check("plate")
  .isLength({ min: 3 })
  .withMessage("Plate number must be at least 3 characters.")
  .optional(),
  check("make")
  .isLength({ min: 3 })
  .withMessage("The make must be at least 3 characters."),
  check("model").isLength({ min: 2 })
  .withMessage("The model name must be at least 2 characters."),
  check("year").isLength({ min: 4 })
  .withMessage("Please enter a valid year."),
  check("vin").isLength({ min: 4 })
  .withMessage("Please enter a valid VIN number.").optional(),
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
  .withMessage("The make must be at least 3 characters.").optional(),
  check("model").isLength({ min: 2 })
  .withMessage("The model name must be at least 2 characters.").optional(),
  check("year").isLength({ min: 4 })
  .withMessage("Please enter a valid year.").optional(),
  check("vin").isLength({ min: 4 })
  .withMessage("Please enter a valid VIN number.").optional(),
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
  param("bikeId").notEmpty().withMessage("Bike ID is required")
  .isUUID().withMessage("Bike ID must be a valid UUID"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

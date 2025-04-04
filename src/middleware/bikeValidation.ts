import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, validationResult } from "express-validator";

export const validateBikeInfo: RequestHandler[] = [
  check("plate").isLength({ min: 3 }).withMessage("Plate number must be at least 3 characters."),
  check("make").isLength({ min: 3 }).withMessage("The make must be at least 3 characters."),
  check("model").isLength({ min: 2 }).withMessage("The model name must be at least 2 characters."),
  check("year").isLength({ min: 4 }).withMessage("Please enter a valid year."),
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

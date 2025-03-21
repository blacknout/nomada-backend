import { Request, Response, NextFunction, RequestHandler } from "express";
import { param,check, validationResult } from "express-validator";

export const validateGroupInfo: RequestHandler[] = [
  check("name").isLength({ min: 3 }).withMessage("The group name must be at least 3 characters."),
  check("description").isLength({ min: 3 }).withMessage("The group description must be longer."),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    next();
  }) as RequestHandler,
];

export const validateGroupQuery: RequestHandler[] = [
  param("groupId").notEmpty().withMessage("Group ID is required")
  .isUUID().withMessage("Group ID must be a valid UUID"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    next();
  }) as RequestHandler,
];
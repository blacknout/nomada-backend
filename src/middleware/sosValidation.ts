import { Request, Response, NextFunction, RequestHandler } from "express";
import { query, check, validationResult } from "express-validator";

export const validateSosInputs: RequestHandler[] = [
  query("id")
  .isUUID()
  .withMessage("Invalid UUID format for ID"),

  check("isActivated")
    .isBoolean()
    .withMessage('Activated must be a boolean value.')
    .optional(),

  check("contactId")
    .isUUID()
    .withMessage("Invalid UUID format for Contact ID")
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

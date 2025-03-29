import { Request, Response, NextFunction, RequestHandler } from "express";
import { param, check, validationResult } from "express-validator";

export const validateRegisterUser: RequestHandler[] = [
  check("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters."),
  check("firstname")
    .isLength({ min: 3 })
    .withMessage("Your first name must be at least 3 characters."),
  check("lastname")
    .isLength({ min: 3 })
    .withMessage("Your last name must be at least 3 characters."),
  check("state").isLength({ min: 2 }).withMessage("Enter a valid state."),
  check("country").isLength({ min: 3 }).withMessage("Select a valid country."),
  check("email").isEmail().withMessage("Invalid email format."),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters.")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter"),
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

export const validateLoginUser: RequestHandler[] = [
  check("email").isEmail().withMessage("Invalid email format"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

export const validateUpdateUser: RequestHandler[] = [
  check("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters.")
    .optional(),
  check("firstname")
    .isLength({ min: 3 })
    .withMessage("Your first name must be at least 3 characters.")
    .optional(),
  check("lastname")
    .isLength({ min: 3 })
    .withMessage("Your last name must be at least 3 characters.")
    .optional(),
  check("state")
    .isLength({ min: 2 })
    .withMessage("Enter a valid state.")
    .optional(),
  check("country")
    .isLength({ min: 3 })
    .withMessage("Select a valid country.")
    .optional(),
  check("email").isEmail().withMessage("Invalid email format.").optional(),
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

export const validateChangePassword: RequestHandler[] = [
  check("oldPassword")
    .isLength({ min: 6 })
    .withMessage("Old password must be at least 6 characters"),
  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

export const validateResetPassword: RequestHandler[] = [
  check("email").isEmail().withMessage("Invalid email format."),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

export const validatePasswordOTP: RequestHandler[] = [
  check("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid OTP")
    .isNumeric()
    .withMessage("Invalid OTP"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

export const validateUserQuery: RequestHandler[] = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    next();
  }) as RequestHandler,
];

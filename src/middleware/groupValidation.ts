import { Request, Response, NextFunction, RequestHandler } from "express";
import { check, validationResult } from "express-validator";

export const validateGroupInfo: RequestHandler[] = [
  check("name").isLength({ min: 3 }).withMessage("The group name must be at least 3 characters."),
  check("description").isLength({ min: 3 }).withMessage("The group description must be longer."),
  check("userIds")
  .isArray({ min: 1 })
  .withMessage("userIds must be a non-empty array").optional(),
  check("userIds.*")
  .isUUID()
  .withMessage("User ID must be a valid UUID").optional(),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateGroupQuery: RequestHandler[] = [
  check("groupId").notEmpty().withMessage("Group ID is required")
  .isUUID().withMessage("Group ID must be a valid UUID"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];


export const validateInviteToGroup: RequestHandler[] = [
  check("userIds")
  .isArray({ min: 1 }) 
  .withMessage("userIds must be a non-empty array"),
  check("userIds.*")
  .isUUID()
  .withMessage("User ID must be a valid UUID"),
  check("groupId").notEmpty().withMessage("Group ID is required")
  .isUUID().withMessage("Group ID must be a valid UUID"),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateRespondToInvite: RequestHandler[] = [
  check("inviteId")
  .isUUID()
  .withMessage("Invite ID must be a valid UUID"),
  check("response").notEmpty().withMessage("Response is required")
  .isIn(["accepted", "rejected"])
  .withMessage("Response must be either accepted or rejected."),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateGroupPrivacy: RequestHandler[] = [
  check("groupId").notEmpty().withMessage("Group ID is required")
  .isUUID().withMessage("Group ID must be a valid UUID"),
  check("privacy").isBoolean().withMessage('Privacy must be a boolean value.'),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];

export const validateMemberStatus: RequestHandler[] = [
  check("type").notEmpty().withMessage("Selecting a type is required")
  .isIn(["active", "ghost", "observer", "inactive"]).withMessage("Type must be one of: active, ghost, observer or inactive"),
  check("groupId").isUUID().withMessage("Group ID must be a valid UUID"),
  check("userId").isUUID().withMessage("User ID must be a valid UUID").optional(),
  ((req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return
    }
    next();
  }) as RequestHandler,
];



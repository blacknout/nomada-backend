"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserQuery = exports.validateChangePassword = exports.validateUpdateUser = exports.validateLoginUser = exports.validateRegisterUser = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegisterUser = [
    (0, express_validator_1.check)("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters."),
    (0, express_validator_1.check)("firstname").isLength({ min: 3 }).withMessage("Your first name must be at least 3 characters."),
    (0, express_validator_1.check)("lastname").isLength({ min: 3 }).withMessage("Your last name must be at least 3 characters."),
    (0, express_validator_1.check)("state").isLength({ min: 2 }).withMessage("Enter a valid state."),
    (0, express_validator_1.check)("country").isLength({ min: 3 }).withMessage("Select a valid country."),
    (0, express_validator_1.check)("email").isEmail().withMessage("Invalid email format."),
    (0, express_validator_1.check)("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];
exports.validateLoginUser = [
    (0, express_validator_1.check)("email").isEmail().withMessage("Invalid email format"),
    (0, express_validator_1.check)("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];
exports.validateUpdateUser = [
    (0, express_validator_1.check)("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters."),
    (0, express_validator_1.check)("firstname").isLength({ min: 3 }).withMessage("Your first name must be at least 3 characters."),
    (0, express_validator_1.check)("lastname").isLength({ min: 3 }).withMessage("Your last name must be at least 3 characters."),
    (0, express_validator_1.check)("state").isLength({ min: 2 }).withMessage("Enter a valid state."),
    (0, express_validator_1.check)("country").isLength({ min: 3 }).withMessage("Select a valid country."),
    (0, express_validator_1.check)("email").isEmail().withMessage("Invalid email format."),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];
exports.validateChangePassword = [
    (0, express_validator_1.check)("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];
exports.validateUserQuery = [
    (0, express_validator_1.param)("userId").notEmpty().withMessage("User ID is required")
        .isUUID().withMessage("User ID must be a valid UUID"),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBikeQuery = exports.validateBikeInfo = void 0;
const express_validator_1 = require("express-validator");
exports.validateBikeInfo = [
    (0, express_validator_1.check)("plateNumber").isLength({ min: 3 }).withMessage("Plate number must be at least 3 characters."),
    (0, express_validator_1.check)("make").isLength({ min: 3 }).withMessage("The make must be at least 3 characters."),
    (0, express_validator_1.check)("model").isLength({ min: 2 }).withMessage("The model name must be at least 2 characters."),
    (0, express_validator_1.check)("year").isLength({ min: 4 }).withMessage("Please enter a valid year."),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];
exports.validateBikeQuery = [
    (0, express_validator_1.param)("bikeId").notEmpty().withMessage("Bike ID is required")
        .isUUID().withMessage("Bike ID must be a valid UUID"),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];

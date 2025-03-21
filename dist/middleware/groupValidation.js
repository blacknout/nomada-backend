"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGroupQuery = exports.validateGroupInfo = void 0;
const express_validator_1 = require("express-validator");
exports.validateGroupInfo = [
    (0, express_validator_1.check)("name").isLength({ min: 3 }).withMessage("The group name must be at least 3 characters."),
    (0, express_validator_1.check)("description").isLength({ min: 3 }).withMessage("The group description must be longer."),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];
exports.validateGroupQuery = [
    (0, express_validator_1.param)("groupId").notEmpty().withMessage("Group ID is required")
        .isUUID().withMessage("Group ID must be a valid UUID"),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];

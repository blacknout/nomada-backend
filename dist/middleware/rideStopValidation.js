"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStopQuery = exports.validateRideStopInfo = void 0;
const express_validator_1 = require("express-validator");
exports.validateRideStopInfo = [
    (0, express_validator_1.param)("rideId").isUUID().withMessage("Ride ID must be a valid UUID"),
    (0, express_validator_1.param)("stopId").isUUID().withMessage("Stop ID must be a valid UUID"),
    (0, express_validator_1.check)("reason").isString().withMessage("Reason must be a string")
        .isIn(["rest", "accident", "mechanical_fault"]).withMessage("Reason must be one of: rest, accident, mechanical_fault"),
    (0, express_validator_1.check)("location").isObject().withMessage("Location must be an object")
        .custom((value) => {
        if (!value.latitude || !value.longitude) {
            throw new Error("Location must have latitude and longitude");
        }
        if (typeof value.latitude !== "number" || typeof value.longitude !== "number") {
            throw new Error("Latitude and longitude must be numbers");
        }
        if (value.latitude < -90 || value.latitude > 90) {
            throw new Error("Latitude must be between -90 and 90");
        }
        if (value.longitude < -180 || value.longitude > 180) {
            throw new Error("Longitude must be between -180 and 180");
        }
        return true;
    }),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];
exports.validateStopQuery = [
    (0, express_validator_1.param)("stopId").notEmpty().withMessage("Stop ID is required")
        .isUUID().withMessage("Stop ID must be a valid UUID"),
    ((req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    }),
];

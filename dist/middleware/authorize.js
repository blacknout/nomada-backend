"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorize = () => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (req.user.isAdmin !== true) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
exports.default = authorize;

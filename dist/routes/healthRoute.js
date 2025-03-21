"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthController_1 = require("../controllers/healthController");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Get the health of the app
 *     tags:
 *       - Health
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Health Status Confirmed.
 */
router.get("/health", healthController_1.health);
exports.default = router;

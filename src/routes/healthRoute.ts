import express from "express";
import { health } from "../controllers/healthController";

const router = express.Router();


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
router.get("/health", health);

export default router;

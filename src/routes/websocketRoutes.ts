import express from 'express';
import { 
  sendWebSocketMessage, 
  getConnectionStatus 
} from '../controllers/websocketController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/ws/send:
 *   post:
 *     summary: Send a message through WebSocket
 *     tags:
 *       - WebSocket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - targetId
 *               - messageType
 *               - payload
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [user, group, ride]
 *               targetId:
 *                 type: string
 *               messageType:
 *                 type: string
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid target type
 *       401:
 *         description: Unauthorized
 */
router.post('/send', authenticateUser, sendWebSocketMessage);

/**
 * @swagger
 * /api/ws/status:
 *   get:
 *     summary: Get WebSocket connection status
 *     tags:
 *       - WebSocket
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WebSocket status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 connections:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/status', authenticateUser, getConnectionStatus);

export default router;

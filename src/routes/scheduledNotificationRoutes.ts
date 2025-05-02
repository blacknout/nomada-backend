import express from 'express';
import {
  createScheduledNotification,
  createOneTimeNotification,
  cancelNotification,
  getAllScheduledNotifications
} from '../controllers/scheduledNotificationController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/scheduled-notifications:
 *   post:
 *     summary: Create a new scheduled notification
 *     tags:
 *       - Scheduled Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - title
 *               - body
 *               - cronExpression
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to send notification to
 *               title:
 *                 type: string
 *                 description: Notification title
 *               body:
 *                 type: string
 *                 description: Notification body text
 *               cronExpression:
 *                 type: string
 *                 description: Cron expression for scheduling
 *                 example: "0 8 * * *"
 *               data:
 *                 type: object
 *                 description: Additional data to include with the notification
 *               oneTime:
 *                 type: boolean
 *                 description: Whether the notification should only be sent once
 *     responses:
 *       201:
 *         description: Scheduled notification created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateUser, createScheduledNotification);

/**
 * @swagger
 * /api/scheduled-notifications/one-time:
 *   post:
 *     summary: Create a one-time scheduled notification for a specific date
 *     tags:
 *       - Scheduled Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - title
 *               - body
 *               - scheduledDate
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to send notification to
 *               title:
 *                 type: string
 *                 description: Notification title
 *               body:
 *                 type: string
 *                 description: Notification body text
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 description: ISO date string when the notification should be sent
 *               data:
 *                 type: object
 *                 description: Additional data to include with the notification
 *     responses:
 *       201:
 *         description: One-time notification scheduled successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/one-time', authenticateUser, createOneTimeNotification);

/**
 * @swagger
 * /api/scheduled-notifications/{notificationId}:
 *   delete:
 *     summary: Cancel a scheduled notification
 *     tags:
 *       - Scheduled Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         description: ID of the scheduled notification to cancel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification cancelled successfully
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Scheduled notification not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:notificationId', authenticateUser, cancelNotification);

/**
 * @swagger
 * /api/scheduled-notifications:
 *   get:
 *     summary: Get all scheduled notifications
 *     tags:
 *       - Scheduled Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all scheduled notifications
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateUser, getAllScheduledNotifications);

export default router;

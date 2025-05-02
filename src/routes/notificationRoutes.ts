import express from 'express';
import { 
  registerPushToken, 
  unregisterPushToken, 
  sendTestNotification,
  sendNotificationToSpecificUser
} from '../controllers/notificationController';
import { authenticateUser } from '../middleware/auth';
import { validatePushTokenInfo } from '../middleware/notificationValidation';

const router = express.Router();

/**
 * @swagger
 * /api/notifications/token:
 *   post:
 *     summary: Register or update push notification token
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pushToken
 *             properties:
 *               pushToken:
 *                 type: string
 *                 description: Valid Expo push notification token
 *     responses:
 *       200:
 *         description: Push notification token registered successfully
 *       400:
 *         description: Invalid request - missing or invalid token
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/token', authenticateUser, validatePushTokenInfo, registerPushToken);

/**
 * @swagger
 * /api/notifications/token:
 *   delete:
 *     summary: Unregister push notification token
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Push notification token unregistered successfully
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/token', authenticateUser, unregisterPushToken);

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send a test notification to the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test notification sent successfully
 *       400:
 *         description: User does not have a registered push token
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/test', authenticateUser, sendTestNotification);

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send a notification to a specific user (admin only)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetUserId
 *               - title
 *               - body
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: ID of the user to send notification to
 *               title:
 *                 type: string
 *                 description: Notification title
 *               body:
 *                 type: string
 *                 description: Notification body text
 *               data:
 *                 type: object
 *                 description: Additional data to include with the notification
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       400:
 *         description: Target user does not have a registered push token
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Target user not found
 *       500:
 *         description: Internal server error
 */
router.post('/send', authenticateUser, sendNotificationToSpecificUser);

export default router;

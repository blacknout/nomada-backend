import { Request, Response } from 'express';
import User from '../models/User';
import { 
  sendNotificationToUser,
  handlePushNotificationReceipts
} from '../services/notificationService';
import errorResponse from '../errors/errorResponse';
import logger from '../utils/logger';

/**
 * Register or update a push notification token for the current user
 * @param req Express request object with pushToken in body
 * @param res Express response object
 */
export const registerPushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token: pushToken } = req.body;
    const userId = req.user?.id;

    // Update the user's push token
    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.update({ pushToken });
    
    res.status(200).json({ 
      message: 'Push notification token registered successfully',
      userId,
      pushToken
    });
  } catch (error) {
    logger.error('Error registering push token:', error);
    errorResponse(res, error);
  }
};

/**
 * Unregister push notification token for current user
 * @param req Express request object
 * @param res Express response object
 */
export const unregisterPushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.update({ pushToken: null });
    
    res.status(200).json({ 
      message: 'Push notification token unregistered successfully',
      userId
    });
  } catch (error) {
    logger.error('Error unregistering push token:', error);
    errorResponse(res, error);
  }
};

/**
 * Send test notification to the current user
 * @param req Express request object
 * @param res Express response object
 */
export const sendTestNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const priority = req.body.priority;

    const user = await User.findByPk(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.pushToken) {
      res.status(400).json({ message: 'User does not have a registered push token' });
      return;
    }

    const title = 'Test Notification';
    const body = 'This is a test notification from Nomada!';
    const data = { type: 'test', timestamp: new Date().toISOString() };

    const tickets = await sendNotificationToUser(userId, title, body, data, user, priority);
    
    if (!tickets || tickets.length === 0) {
      res.status(500).json({ message: 'Failed to send notification' });
      return;
    }

    // Handle receipts in the background
    handlePushNotificationReceipts(tickets).catch(err => {
      logger.error('Error handling notification receipts:', err);
    });

    res.status(200).json({ 
      message: 'Test notification sent successfully',
      tickets
    });
  } catch (error) {
    logger.error('Error sending test notification:', error);
    errorResponse(res, error);
  }
};

/**
 * Send a notification to a specific user (admin only)
 * @param req Express request object with targetUserId, title, body in the request body
 * @param res Express response object
 */
export const sendNotificationToSpecificUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetUserId, title, body, data } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if the user exists
    const targetUser = await User.findByPk(targetUserId);
    
    if (!targetUser) {
      res.status(404).json({ message: 'Target user not found' });
      return;
    }

    if (!targetUser.pushToken) {
      res.status(400).json({ message: 'Target user does not have a registered push token' });
      return;
    }

    // Pass the user object directly instead of just the ID to avoid redundant lookup
    const tickets = await sendNotificationToUser(targetUserId, title, body, data || {}, targetUser);
    
    if (!tickets || tickets.length === 0) {
      res.status(500).json({ message: 'Failed to send notification' });
      return;
    }

    // Handle receipts in the background
    handlePushNotificationReceipts(tickets).catch(err => {
      logger.error('Error handling notification receipts:', err);
    });

    res.status(200).json({ 
      message: 'Notification sent successfully',
      targetUserId,
      tickets
    });
  } catch (error) {
    logger.error('Error sending notification to specific user:', error);
    errorResponse(res, error);
  }
}; 
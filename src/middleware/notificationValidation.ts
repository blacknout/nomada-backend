import { Request, Response, NextFunction } from 'express';
import { isValidExpoPushToken } from '../services/notificationService';

/**
 * Validates push token data in the request body
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const validatePushTokenInfo = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Push token is required' });
      return;
    }

    if (typeof token !== 'string') {
      res.status(400).json({ message: 'Push token must be a string' });
      return;
    }

    // Optional: validate token format
    if (!isValidExpoPushToken(token)) {
      res.status(400).json({ message: 'Invalid Expo push token format' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating push token', error: (error as Error).message });
  }
};

/**
 * Validates notification sending data in the request body
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const validateNotificationSendInfo = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { targetUserId, title, body } = req.body;

    if (!targetUserId) {
      res.status(400).json({ message: 'Target user ID is required' });
      return;
    }

    if (!title) {
      res.status(400).json({ message: 'Notification title is required' });
      return;
    }

    if (!body) {
      res.status(400).json({ message: 'Notification body is required' });
      return;
    }

    // Sanitize additional data if needed
    if (req.body.data && typeof req.body.data !== 'object') {
      res.status(400).json({ message: 'Notification data must be an object' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating notification data', error: (error as Error).message });
  }
};

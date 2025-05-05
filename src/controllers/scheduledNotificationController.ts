import { Request, Response } from 'express';
import { 
  scheduleNotification, 
  scheduleOneTimeNotification,
  cancelScheduledNotification,
  getScheduledNotifications
} from '../services/scheduledNotificationService';
import errorResponse from '../errors/errorResponse';
import logger from '../utils/logger';

/**
 * Create a new scheduled notification
 * @param req Express request object
 * @param res Express response object
 */
export const createScheduledNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userIds, title, body, cronExpression, data, oneTime } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: 'User IDs array is required and must not be empty' });
      return;
    }
    
    if (!title || !body || !cronExpression) {
      res.status(400).json({ message: 'Title, body, and cronExpression are required' });
      return;
    }
    
    const notificationId = scheduleNotification(
      userIds,
      title,
      body,
      cronExpression,
      data || {},
      oneTime || false
    );
    
    res.status(201).json({
      message: 'Scheduled notification created successfully',
      notificationId
    });
  } catch (error) {
    logger.error('Error creating scheduled notification:', error);
    errorResponse(res, error);
  }
};

/**
 * Create a one-time scheduled notification
 * @param req Express request object
 * @param res Express response object
 */
export const createOneTimeNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userIds, title, body, scheduledDate, data } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: 'User IDs array is required and must not be empty' });
      return;
    }
    
    if (!title || !body || !scheduledDate) {
      res.status(400).json({ message: 'Title, body, and scheduledDate are required' });
      return;
    }
    
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }
    
    if (date < new Date()) {
      res.status(400).json({ message: 'Scheduled date must be in the future' });
      return;
    }
    
    const notificationId = scheduleOneTimeNotification(
      userIds,
      title,
      body,
      date,
      data || {}
    );
    
    res.status(201).json({
      message: 'One-time notification scheduled successfully',
      notificationId,
      scheduledDate: date
    });
  } catch (error) {
    logger.error('Error creating one-time notification:', error);
    errorResponse(res, error);
  }
};

/**
 * Cancel a scheduled notification
 * @param req Express request object
 * @param res Express response object
 */
export const cancelNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId) {
      res.status(400).json({ message: 'Notification ID is required' });
      return;
    }
    
    const result = cancelScheduledNotification(notificationId);
    
    if (result) {
      res.status(200).json({
        message: 'Scheduled notification cancelled successfully',
        notificationId
      });
    } else {
      res.status(404).json({
        message: 'Scheduled notification not found',
        notificationId
      });
    }
  } catch (error) {
    logger.error('Error cancelling scheduled notification:', error);
    errorResponse(res, error);
  }
};

/**
 * Get all scheduled notifications
 * @param req Express request object
 * @param res Express response object
 */
export const getAllScheduledNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = getScheduledNotifications();
    
    res.status(200).json({
      message: 'Scheduled notifications retrieved successfully',
      count: notifications.length,
      notifications
    });
  } catch (error) {
    logger.error('Error retrieving scheduled notifications:', error);
    errorResponse(res, error);
  }
};

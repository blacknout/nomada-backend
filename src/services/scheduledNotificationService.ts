import { CronJob } from 'cron';
import { v4 as uuidv4 } from 'uuid';
import { sendNotificationToUser, sendNotificationToUsers } from './notificationService';
import logger from '../utils/logger';

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  userIds: string[];
  cronExpression: string;
  job: CronJob;
  oneTime: boolean;
}

// Store for active scheduled notifications
const scheduledNotifications: Map<string, ScheduledNotification> = new Map();

/**
 * Schedule a notification to be sent at specified time(s)
 * @param userIds Array of user IDs to receive the notification
 * @param title Notification title
 * @param body Notification body
 * @param cronExpression Cron expression for when to send the notification
 * @param data Additional data for the notification
 * @param oneTime Whether this notification should only run once
 * @returns ID of the scheduled notification
 */
export const scheduleNotification = (
  userIds: string[],
  title: string,
  body: string,
  cronExpression: string,
  data: any = {},
  oneTime: boolean = false
): string => {
  const id = uuidv4();
  
  const job = new CronJob(
    cronExpression,
    async () => {
      try {
        logger.info(`Running scheduled notification: ${id}`);
        
        if (userIds.length === 1) {
          await sendNotificationToUser(userIds[0], title, body, data);
        } else {
          await sendNotificationToUsers(userIds, title, body, data);
        }
        
        logger.info(`Scheduled notification ${id} sent successfully to ${userIds.length} user(s)`);
        
        // If one-time notification, remove it after sending
        if (oneTime) {
          cancelScheduledNotification(id);
        }
      } catch (error) {
        logger.error(`Error sending scheduled notification ${id}:`, error);
      }
    },
    null, // onComplete
    true, // start immediately
    'UTC' // timezone
  );
  
  const notification: ScheduledNotification = {
    id,
    title,
    body,
    data,
    userIds,
    cronExpression,
    job,
    oneTime
  };
  
  scheduledNotifications.set(id, notification);
  logger.info(`Scheduled notification created with ID: ${id}, cron: ${cronExpression}`);
  
  return id;
};

/**
 * Schedule a one-time notification for a specific date
 * @param userIds Array of user IDs to receive the notification
 * @param title Notification title
 * @param body Notification body
 * @param scheduledDate Date to send the notification
 * @param data Additional data for the notification
 * @returns ID of the scheduled notification
 */
export const scheduleOneTimeNotification = (
  userIds: string[],
  title: string,
  body: string,
  scheduledDate: Date,
  data: any = {}
): string => {
  const date = new Date(scheduledDate);
  
  // Create cron expression for the specific date
  const cronExpression = `${date.getUTCSeconds()} ${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} *`;
  
  return scheduleNotification(userIds, title, body, cronExpression, data, true);
};

/**
 * Cancel a scheduled notification
 * @param id ID of the scheduled notification to cancel
 * @returns boolean indicating success
 */
export const cancelScheduledNotification = (id: string): boolean => {
  const notification = scheduledNotifications.get(id);
  
  if (!notification) {
    logger.warn(`Attempted to cancel non-existent scheduled notification: ${id}`);
    return false;
  }
  
  notification.job.stop();
  scheduledNotifications.delete(id);
  logger.info(`Scheduled notification ${id} cancelled`);
  
  return true;
};

/**
 * Get all active scheduled notifications
 * @returns Array of scheduled notification info
 */
export const getScheduledNotifications = (): Array<Omit<ScheduledNotification, 'job'>> => {
  return Array.from(scheduledNotifications.values()).map(({ job, ...rest }) => rest);
};

/**
 * Stop all scheduled notifications
 */
export const stopAllScheduledNotifications = (): void => {
  scheduledNotifications.forEach((notification) => {
    notification.job.stop();
  });
  
  scheduledNotifications.clear();
  logger.info('All scheduled notifications stopped');
};

// Stop all scheduled notifications when the process exits
process.on('SIGINT', () => {
  stopAllScheduledNotifications();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAllScheduledNotifications();
  process.exit(0);
});

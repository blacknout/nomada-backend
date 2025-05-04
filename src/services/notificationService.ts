import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { Notification } from "../models/Notifications";
import User from "../models/User";
import logger from "../utils/logger";

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Validates if a push token is valid for Expo
 * @param pushToken The push token to validate
 * @returns boolean indicating if token is valid
 */
export const isValidExpoPushToken = (pushToken: string): boolean => {
  return Expo.isExpoPushToken(pushToken);
};

/**
 * Create notification message save to database
 * @param userId User ID
 * @param title Title of the notification
 * @param message Message of the notification
 * @param type Type of the notification
 * @param data Additional data to send with the notification
 * @returns Notification object
 **/
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "message" | "sos" | "invite",
  data: any
) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    data,
  });

  return notification;
};

/**
 * Sends push notifications to specified tokens
 * @param messages Array of push notification messages to send
 * @returns Promise with the results of the send operation
 */
export const sendPushNotifications = async (
  messages: ExpoPushMessage[]
): Promise<ExpoPushTicket[]> => {
  // Filter out any invalid tokens
  const validMessages = messages.filter(
    (message) => message.to && Expo.isExpoPushToken(message.to as string)
  );

  const chunks = expo.chunkPushNotifications(validMessages);
  const tickets: ExpoPushTicket[] = [];

  try {
    // Send the chunks to Expo's push notification service
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        logger.error("Error sending push notification chunk:", error);
      }
    }
    return tickets;
  } catch (error) {
    logger.error("Error in sendPushNotifications:", error);
    throw error;
  }
};

/**
 * Creates a notification message for a specific recipient
 * @param token Push token for the recipient
 * @param title Title of the notification
 * @param body Body text of the notification
 * @param data Additional data to send with the notification
 * @returns ExpoPushMessage object ready to send
 */
export const createNotificationMessage = (
  token: string,
  title: string,
  body: string,
  data: any = {},
  priority: "high" | "normal" = "normal"
): ExpoPushMessage => {
  return {
    to: token,
    sound: "default",
    title,
    body,
    data,
    priority,
  };
};

/**
 * Sends notification to a specific user
 * @param userId ID of the user to send notification to
 * @param title Title of the notification
 * @param body Body text of the notification
 * @param data Additional data to send with the notification
 * @returns Result of the send operation or null if unsuccessful
 */
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data: any = {}
): Promise<ExpoPushTicket[] | null> => {
  try {
    const user = await User.findByPk(userId);

    if (!user || !user.pushToken) {
      return null;
    }

    if (!isValidExpoPushToken(user.pushToken)) {
      logger.warn(`Invalid push token for user ${userId}`);
      return null;
    }

    const message = createNotificationMessage(
      user.pushToken,
      title,
      body,
      data
    );
    return await sendPushNotifications([message]);
  } catch (error) {
    logger.error("Error in sendNotificationToUser:", error);
    return null;
  }
};

/**
 * Sends notification to multiple users
 * @param userIds Array of user IDs to send notifications to
 * @param title Title of the notification
 * @param body Body text of the notification
 * @param data Additional data to send with the notification
 * @returns Results of the send operations
 */
export const sendNotificationToUsers = async (
  userIds: string[],
  title: string,
  body: string,
  data: any = {}
): Promise<ExpoPushTicket[]> => {
  try {
    const users = await User.findAll({
      where: {
        id: userIds,
        pushToken: { [Symbol.for("ne")]: null }, // Only users with pushTokens
      },
    });

    const validUsers = users.filter(
      (user) => user.pushToken && isValidExpoPushToken(user.pushToken)
    );

    if (validUsers.length === 0) {
      return [];
    }

    const messages = validUsers.map((user) =>
      createNotificationMessage(user.pushToken!, title, body, data)
    );

    return await sendPushNotifications(messages);
  } catch (error) {
    logger.error("Error in sendNotificationToUsers:", error);
    return [];
  }
};

/**
 * Handles receipt checking for sent notifications
 * @param tickets Array of push notification tickets to check
 */
export const handlePushNotificationReceipts = async (
  tickets: ExpoPushTicket[]
): Promise<void> => {
  const receiptIds: string[] = [];

  for (const ticket of tickets) {
    // The expo-server-sdk types don't properly define the id property
    // Using type assertion to access the id property
    const ticketId = (ticket as any).id;
    if (ticketId) {
      receiptIds.push(ticketId);
    }
  }

  if (receiptIds.length === 0) {
    return;
  }

  const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of receiptChunks) {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

      for (const [id, receipt] of Object.entries(receipts)) {
        if (receipt.status === "error") {
          logger.error(
            `Error sending notification with receipt ID ${id}:`,
            receipt.message
          );

          // Handle specific error types
          if (receipt.details && receipt.details.error) {
            // Handle token invalidation
            if (receipt.details.error === "DeviceNotRegistered") {
              // TODO: Remove or update the invalid token in your database
              logger.warn(`Invalid push token detected with receipt ID ${id}`);
            }
          }
        }
      }
    } catch (error) {
      logger.error("Error checking notification receipts:", error);
    }
  }
};

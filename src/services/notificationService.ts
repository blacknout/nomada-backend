import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { 
  NotificationType,
  NotificationPriority,
} from '../@types/model';
import { Notification } from "../models/Notification";
import { notification } from "../utils/constants/notifications";
import { LOCATION_GPS_COORDINATES } from "../utils/constants/constants";
import { filterUser } from "../utils/handleData";
import User from "../models/User";
import Bike from "../models/Bike";
import logger from "../utils/logger";
import { Location } from "../@types/location";

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
  type: NotificationType,
  priority: NotificationPriority,
  data: any
) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    priority,
    data,
  });

  return notification;
};

/**
 * Create multiple notifications message save to database
 * @param userIds Users ID
 * @param title Title of the notification
 * @param message Message of the notification
 * @param type Type of the notification
 * @param data Additional data to send with the notification
 * @returns Notification object
 **/
export const createNotifications = async (
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType,
  priority: NotificationPriority,
  data: any
) => {
  const notification = userIds.map(async(userId) =>
     await Notification.create({
        userId,
        title,
        message,
        type,
        priority,
        data,
      })
    )
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
  console.log("🚀 ~ chunks:", JSON.stringify(validMessages), chunks.length)
  const tickets: ExpoPushTicket[] = [];

  try {
    // Send the chunks to Expo's push notification service
    for (const chunk of chunks) {
      console.log("🚀 ~ chunk:", chunk)
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("🚀 ~ ticketChunk:", ticketChunk)
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
 * @param userObject Optional user object to prevent redundant database lookup
 * @returns Result of the send operation or null if unsuccessful
 */
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data: any = {},
  userObject?: any,
  priority?: string,
): Promise<ExpoPushTicket[] | null> => {
  try {
    // Use provided user object if available, otherwise fetch from database
    const user = userObject || await User.findByPk(userId);
    console.log("🚀 ~ user.pushToken:", user?.pushToken)
    
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
      data,
      priority || data.priority
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
  data: any = {},
  priority: "high" | "normal" = "normal"
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
      createNotificationMessage(user.pushToken!, title, body, data, priority)
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

export const sendSearchedVinNotification = async(bikeOwner: User, searchingUser: User, bike: Bike, location: Location) => {
  const data = {
    type: 'search-vin',
    location,
    bikeId: bike.id,
    username: searchingUser.username,
    firstname: searchingUser.firstname,
    lastname: searchingUser.lastname
  }
  const searchLocation = location.address? location.address : LOCATION_GPS_COORDINATES;
  await createNotification(
    bike.userId,
    notification.STOLEN_VIN_SEARCH_TITLE,
    notification.STOLEN_VIN_SEARCH_MESSAGE(
      bike.plate,
      searchLocation
    ),
    "search-vin",
    "high",
    data
  );
  await sendNotificationToUser(
    bikeOwner.id,
    notification.STOLEN_VIN_SEARCH_TITLE,
    notification.STOLEN_VIN_SEARCH_MESSAGE(
      bike.plate,
      searchLocation
    ),
    data,
    filterUser(bikeOwner.toJSON()),
    "high"
  );
}
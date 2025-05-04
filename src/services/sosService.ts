import { sendSosEmail } from "../services/emailService";
import { messages } from "../utils/constants/notifications";
import {
  createNotification,
  sendNotificationToUser,
} from "../services/notificationService";
import logger from "../utils/logger";

export const sendSos = async (user: any, location: any) => {
  const { sos } = user;
  const messageContent = messages.SOS_NOTIFICATION;
  const messageTitle = messages.SOS_TITLE(user.username);

  // Send notification to emergency contact if available
  if (sos.contactId) {
    try {
      await createNotification(
        sos.contactId,
        messageTitle,
        messageContent,
        "sos",
        location
      );
      await sendNotificationToUser(
        sos.contactId,
        messageTitle,
        messageContent,
        {
          type: "sos",
          userId: user.id,
          userName: user.username,
          location,
        }
      );
      logger.info(
        `SOS notification sent to contact ${sos.contactId} for user ${user.username}(${user.id})`
      );
    } catch (error) {
      logger.error(
        `Failed to send SOS notification to contact ${sos.contactId}:`,
        error
      );
    }
  }

  // Send email if available
  if (sos.email) {
    try {
      await sendSosEmail(sos.email, messageTitle, messageContent, location);
      logger.info(`SOS email sent to ${sos.email} for user ${user.id}`);
    } catch (error) {
      logger.error(`Failed to send SOS email to ${sos.email}:`, error);
    }
  }
};

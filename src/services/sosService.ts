import User from "../models/User";
import { sendSosEmail } from "../services/emailService";
import { notification } from "../utils/constants/notifications";
import {
  UNAVAILABLE_PLATE
} from "../utils/constants/constants";
import {
  getFirstPlate
} from "../utils/handleData";
import {
  createNotification,
  sendNotificationToUser,
} from "../services/notificationService";
import logger from "../utils/logger";

export const sendSos = async (user: any, location: any) => {
  const { sos } = user;
  const messageContent = notification.SOS_NOTIFICATION;
  const messageTitle = notification.SOS_TITLE(user.username);
  const contact = await User.findByPk(sos.contactId);

  // Send notification to emergency contact if available
  if (contact) {
    const bikes = await user.getBikes();
    const plate = bikes.length ? getFirstPlate(bikes) : UNAVAILABLE_PLATE;
    const data = {
      type: "sos",
      username: user.username,
      location,
      plate
    }
    try {
      await createNotification(
        sos.contactId,
        messageTitle,
        messageContent,
        "sos",
        "high",
        data
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

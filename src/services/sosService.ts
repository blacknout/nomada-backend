import { sendSosEmail } from "../services/emailService";
import { messages } from "../utils/constants/notifications";
import { createNotification } from "../services/notificationService";

export const sendSos = async(user: any, location: any) => {
  const { sos } = user;
  const messageContent = messages.SOS_NOTIFICATION;
  const messageTitle = messages.SOS_TITLE(user.username);
  if (sos.contactId) await createNotification(sos.contactId, messageTitle, messageContent, "sos", location);
  if (sos.email) sendSosEmail(sos.email, messageTitle, messageContent, location);
}
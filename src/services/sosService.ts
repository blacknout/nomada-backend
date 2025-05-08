import User from "../models/User";
import GroupMembers from "../models/GroupMembers";
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
  sendNotificationToUsers
} from "../services/notificationService";
import logger from "../utils/logger";
import { Location } from "../@types/location";
import { GroupMember } from "../@types/groupMember";


export const sendSos = async (user: User, location: Location, currentRide: string) => {
  const { sos: userSos } = user;
  const bikes = await user.getBikes();
  const plate = bikes.length ? getFirstPlate(bikes) : UNAVAILABLE_PLATE;
  const messageContent = notification.SOS_NOTIFICATION(user.username);
  const messageTitle = notification.SOS_TITLE;
  const notificationData = {
    type: 'sos',
    username: user.username,
    plate,
    location,
    currentRide
  };

  userSos.map(async(sos) => {
    if (sos.isActivated) {
      // 1. Send notification to SOS contact if they have a push token
      if (sos.contactId) {
        try {
          const contact = await User.findByPk(sos.contactId);
          if (contact && contact.pushToken) {
            await createNotification(
              sos.contactId,
              messageTitle,
              messageContent,
              "sos",
              "high",
              notificationData
            );
            await sendNotificationToUser(
              contact.id,
              messageTitle,
              messageContent,
              {
                type: "sos",
                timestamp: new Date().toISOString(),
                userId: user.id,
                userName: user.username,
                location
              }
            );
            logger.info(`SOS notification sent to contact ${contact.id} for user ${user.id}`);
          }
        } catch (err) {
          logger.error("Error sending SOS notification to contact:", err);
        }
      } else if (sos.email) {
        try {
          await sendSosEmail(sos.email, messageTitle, messageContent, location);
          logger.info(`SOS email sent to ${sos.email} for user ${user.id}`);
        } catch (error) {
          logger.error(`Failed to send SOS email to ${sos.email}:`, error);
        }
      }
    }
  })

  // 2. Send notification to all group members if user is in any groups
  try {
    const groupMemberships = await GroupMembers.findAll({
      where: { userId: user.id }
    });
    
    if (groupMemberships.length > 0) {
      const groupIds = groupMemberships.map((member: GroupMember) => member.groupId);
      
      // Find all members in these groups
      const groupMembers = await GroupMembers.findAll({
        where: { 
          groupId: groupIds,
          userId: { [Symbol.for('ne')]: user.id } // Exclude the user sending the SOS
        }
      });
      
      const memberIds = [...new Set(groupMembers.map((member: GroupMember) => member.userId))];
      
      if (memberIds.length > 0) {
        await sendNotificationToUsers(
          memberIds as string[],
          messageTitle,
          messageContent,
          {
            type: "sos",
            timestamp: new Date().toISOString(),
            userId: user.id,
            location
          },
          "high"
        );
        logger.info(`SOS notifications sent to ${memberIds.length} group members for user ${user.id}`);
      }
    }
  } catch (err) {
    logger.error("Error sending SOS notifications to group members:", err);
  }
}
 
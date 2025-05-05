import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../models/User";
import Sos from "../models/Sos";
import GroupMembers from "../models/GroupMembers";
import { sendNotificationToUser, sendNotificationToUsers } from "../services/notificationService";
import errorResponse from "../errors/errorResponse";
import logger from "../utils/logger";

// Define GroupMembers interface if the model file is not accessible
interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
}

export const createSosContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { contactId, email, phone } = req.body;
    const { id: userId } = req.user;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "This account no longer exists." });
      return;
    }
    // SOS service to inform contact they have been made an SOS
    const sos = await Sos.create({
      contactId,
      email,
      phone,
      userId
    });
    res.status(200).json({ message: "SOS contact has been created.", sos });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const updateSosContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActivated, contactId, email, phone } = req.body;
    const { id: userId } = req.user;
    const user = await User.findByPk(userId, {
      include: [{ model: Sos, as: "sos" }]
    }) as User & { sos: Sos | null };

    if (!user || !user.sos) {
      res.status(404).json({ message: "Cannot get user or the SOS contact." });
      return;
    }
    const { sos } = user;
    // if sosconact id sos email sos phone, send messagee to updated field
    const sosUpdate = await sos.update({
      isActivated: isActivated === false ? false : true,
      contactId: contactId || sos.contactId,
      email: email || sos.email,
      phone: phone || sos.phone,
      userId
    });
    res.status(200).json({ message: "SOS contact has been updated.", sosUpdate });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getSosContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.user;
    const user = await User.findByPk(id, {
      include: [{ model: Sos, as: "sos" }]
    }) as User & { sos: Sos | null };

    res.status(200).json({ message: "SOS contact.", sos: user.sos || null });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const contactSos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, location } = req.body;
    const { id } = req.user;
    const user = await User.findByPk(userId || id, {
      include: [{ model: Sos, as: "sos" }]
    }) as User & { sos: Sos | null };

    if (!user || !user.sos) {
      res.status(404).json({ message: "Cannot get user or the SOS contact." });
      return;
    }

    const { sos } = user;
    if (sos.isActivated) {
      // 1. Send notification to SOS contact if they have a push token
      if (sos.contactId) {
        try {
          const contact = await User.findByPk(sos.contactId);
          if (contact && contact.pushToken) {
            await sendNotificationToUser(
              contact.id,
              "SOS EMERGENCY ALERT!",
              `${user.username || "Someone"} has triggered an emergency SOS alert!`,
              {
                type: "sos",
                timestamp: new Date().toISOString(),
                userId: user.id,
                location
              }
            );
            logger.info(`SOS notification sent to contact ${contact.id} for user ${user.id}`);
          }
        } catch (err) {
          logger.error("Error sending SOS notification to contact:", err);
        }
      }

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
              "SOS EMERGENCY ALERT!",
              `${user.username || "A group member"} has triggered an emergency SOS alert!`,
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

      // SOS service - original response
      res.status(200).json({ message: "SOS has been contacted." });
      return;
    } else {
      res.status(400).json({ message: "This user has deactivated his SOS contact." });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};
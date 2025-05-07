import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../models/User";
import Sos from "../models/Sos";
import GroupMembers from "../models/GroupMembers";
import { createNotification, sendNotificationToUser, sendNotificationToUsers } from "../services/notificationService";
import { notification } from "../utils/constants/notifications";
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
    const { contactId, contactName, email, phone } = req.body;
    const { id: userId } = req.user;
    const contact = await User.findByPk(contactId);
    const contactUsername = contact?.username;

    const sos = await Sos.create({
      contactId: contact.id || null,
      contactName: (contactName || contactUsername) ?? null,
      email,
      phone,
      userId,
      isActivated: true
    });

    if (contact) {
      const data = {
        type: "message",
        userId: contact.id,
        userName: contact.username,
        createdAt: sos.createdAt,
        priority: "normal"
      }

      await createNotification(
        contact.id,
        notification.SOS_CREATE_TITLE,
        notification.SOS_CREATE_MESSAGE(contact.username),
        "message",
        "low",
        data
      );

      await sendNotificationToUser(
        contact.id, 
        notification.SOS_CREATE_TITLE,
        notification.SOS_CREATE_MESSAGE(contact.username),
        data,
        contact
      );
    }

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
    const contact = await User.findByPk(contactId);
    const user = await User.findByPk(userId, {
      include: [{ model: Sos, as: "sos" }]
    }) as User & { sos: Sos | null };

    if (!user || !user.sos) {
      res.status(404).json({ message: "Cannot get user or the SOS contact." });
      return;
    }
    const { sos } = user;
    const sosUpdate = await sos.update({
      isActivated: isActivated === false ? false : true,
      contactId: contact?.id || sos.contactId,
      email: email || sos.email,
      phone: phone || sos.phone,
      userId
    });

    if (contact) {
      const data = {
        type: "message",
        userId: contact.id,
        userName: contact.username,
        createdAt: sos.createdAt,
        priority: "normal"
      }

      await createNotification(
        contact.id,
        notification.SOS_CREATE_TITLE,
        notification.SOS_CREATE_MESSAGE(contact.username),
        "message",
        "low",
        data
      );

      await sendNotificationToUser(
        contact.id, 
        notification.SOS_CREATE_TITLE,
        notification.SOS_CREATE_MESSAGE(contact.username),
        data,
        contact
      );
    }

    res.status(200).json({ message: "SOS contact has been updated.", sosUpdate });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getOwnSos = async (
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
    // The option if a user wants to initiate a riders sos
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

export const rejectSos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const user = await User.findByPk(userId);
    const sos = await Sos.findByPk(id);

    if (sos.contactId === user.id) {
      await sos.update({ contactId: null })
      await sendNotificationToUser(
        sos.userId, 
        notification.SOS_REJECT_TITLE,
        notification.SOS_REJECT_MESSAGE(user.username)
      );
      res.status(200).json({ message: "You have been removed as the SOS contact for this user." });
      return;
    }
    res.status(400).json({ message: "It seems you are not the contact ID for this SOS." });
    return;

  } catch (err) {
    errorResponse(res, err);
  }
};

export const getAllSos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: contactId } = req.user;

    const allSos = await Sos.findAll({
      where: {
        contactId
      }
    });
    res.status(200).json({ allSos });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

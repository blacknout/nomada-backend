import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../models/User";
import Sos from "../models/Sos";
import GroupMembers from "../models/GroupMembers";
import {
  createNotification,
  sendNotificationToUser,
  sendNotificationToUsers
} from "../services/notificationService";
import { sendSos } from "../services/sosService";
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
    const { isActivated, contactId, contactName, email, phone } = req.body;
    const { id: sosId } = req.params;
    const { id: userId } = req.user;
    const contact = await User.findByPk(contactId);
    const sos = await Sos.findByPk(sosId);

    if (sos && contact && contact.id == userId) {
      const sosUpdate = await sos.update({
        isActivated: isActivated === false ? false : true,
        contactId: contact?.id || sos.contactId,
        contactName: contactName || contact.username,
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
    }
    res.status(400).json({ message: "Unable to update SOS contact." });
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
    }) as User & { sos: Sos | [] };

    res.status(200).json({ message: "SOS contact.", sos: user.sos || [] });
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
    const { userId, location, currentRide } = req.body;
    const { id } = req.user;
    // The option if a user wants to initiate a riders sos
    const user = await User.findByPk(userId || id, {
      include: [{ model: Sos, as: "sos" }]
    }) as User & { sos: Sos | [] };

    if (!user || !user.sos.length) {
      res.status(404).json({ message: "Cannot get user or the SOS contact." });
      return;
    }

    await sendSos(user, location, currentRide);
    res.status(200).json({ message: "SOS has been contacted." });
    return;
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

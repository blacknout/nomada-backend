import { Request, Response, NextFunction } from "express";
import { User, Sos } from "../models/associations";
import {
  createNotification,
  sendNotificationToUser,
} from "../services/notificationService";
import { sendSos } from "../services/sosService";
import { notification } from "../utils/constants/notifications";
import errorResponse from "../errors/errorResponse";
import { Op } from "sequelize";

export const createSosContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { contactId, contactName, email, phone } = req.body;
    const { id: userId } = req.user;

    // First check total count of user's SOS contacts
    const totalSosContacts = await Sos.count({
      where: { userId }
    });

    if (totalSosContacts >= 3) {
      res.status(400).json({ message: "You can only have up to 3 SOS contacts." });
      return;
    }

    // Then check for duplicates
    let duplicateCheckClause: any = { userId };
    
    if (contactId) {
      // If contactId exists, check for duplicate user contact
      duplicateCheckClause.contactId = contactId;
    } else if (email || phone) {
      // If no contactId but email/phone exists, check for duplicate non-user contact
      duplicateCheckClause = {
        userId,
        [Op.or]: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      };
    }

    const existingContact = await Sos.findOne({
      where: duplicateCheckClause
    });

    if (existingContact) {
      const message = contactId 
        ? "You already set this user as an SOS contact."
        : "You already have an SOS contact with this email or phone number.";
      res.status(400).json({ message });
      return;
    }

    const contact = contactId ? await User.findByPk(contactId) : null;
    const sosData = {
      contactId: contact?.id || null,
      contactName: contactName || contact?.username || null,
      email,
      phone,
      userId,
      isActivated: true,
    };

    const sos = await Sos.create(sosData);

    if (contact) {
      const data = {
        type: "message",
        userId: contact.id,
        userName: contact.username,
        createdAt: sos.createdAt,
        priority: "normal",
      };

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
    const contact = contactId ? await User.findByPk(contactId) : null;
    const sos = await Sos.findByPk(sosId);

    if (!sos) {
      res.status(404).json({ message: "SOS contact not found." });
      return;
    }

    if (sos.userId !== userId) {
      res.status(403).json({ message: "You are not authorized to update this SOS contact." });
      return;
    }

    const updateData = {
      isActivated: isActivated === false ? false : true,
      contactId: contact?.id || sos.contactId,
      contactName: contactName || contact?.username || sos.contactName,
      ...(email && { email }),
      ...(phone && { phone }),
      userId
    };
    
    const sosUpdate = await sos.update(updateData);
    res.status(200).json({ message: "SOS contact has been updated.", sos: sosUpdate });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getSosContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = req.user;
    const sosContacts = await Sos.findAll({
      where: { userId },
    });

    res.status(200).json({
      message: "SOS contacts retrieved.",
      sos: sosContacts
    });
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
    const user = (await User.findByPk(userId || id, {
      include: [{ model: Sos, as: "sos" }],
    })) as User & { sos: Sos | [] };

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

    if (sos?.contactId === user?.id) {
      await sos.destroy();
      await sendNotificationToUser(
        sos.userId,
        notification.SOS_REJECT_TITLE,
        notification.SOS_REJECT_MESSAGE(user.username)
      );
      res.status(200).json({
        message: "You have been removed as the SOS contact for this user."
      });
      return;
    }
    res.status(400).json({
      message: "It seems you are not the contact ID for this SOS."
    });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getAssignedSos = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: contactId } = req.user;
    const sosContacts = await Sos.findAll({
      where: { contactId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
        },
      ],
    });

    res.status(200).json({
      message: "SOS contacts retrieved successfully.",
      sos: sosContacts,
    });
  } catch (err) {
    errorResponse(res, err);
  }
};

export const removeSosContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;

    const sos = await Sos.findOne({
      where: { 
        userId,
        id
      }
    });

    if (!sos) {
      res.status(404).json({ 
        message: "SOS contact not found or you don't have permission to remove it." 
      });
      return;
    }

    await sos.destroy();

    res.status(200).json({ 
      message: "SOS contact has been removed successfully.",
      sos 
    });
  } catch (err) {
    errorResponse(res, err);
  }
};

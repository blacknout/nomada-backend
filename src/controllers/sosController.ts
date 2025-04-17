import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../models/User";
import Sos from "../models/Sos";
import errorResponse from "../errors/errorResponse";

export const createSosContact = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { isActivated, contactId, email, phone } = req.body;
    const { id: userId } = req.user;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "This account no longer exists." });
      return;
    }
    // SOS service to inform contact they have been made an SOS
    const sos = await Sos.create({
      isActivated,
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

    if (!user || !user.sos) {
      res.status(404).json({ message: "Cannot get user or the SOS contact." });
      return;
    }
    const { sos } = user;
    res.status(200).json({ message: "SOS contact.", sos });
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
    const { userId } = req.body;
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

      // SOS service 
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
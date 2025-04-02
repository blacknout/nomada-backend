import { Request, Response, NextFunction } from "express";
import { ValidationError } from "sequelize";
import { SequelizeError } from "../config/sequelize";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";


/**
 * Create a new group.
 *
 * @param {Request} req - Express request object containing group data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with group details or error
 */
export const createGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id as string;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
    }
    const group = await Group.create({
      name: String(name),
      description: description ? String(description) : null,
      createdBy: String(userId),
    });

    await GroupMember.create({ groupId: group.id, userId });
    res.status(201).json({ message: "Group created successfully", group });

  } catch (err) {
    if (err instanceof ValidationError) {
      const sequelizeError: SequelizeError = err;
      res.status(500).json({ error: sequelizeError.errors});
      return;
    } else {
      res.status(500).json({ error: err });
      return;
    }
  }
};


/**
 * get group details.
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with group details or error
 */
export const getGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByPk(groupId);

    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return
    }
    res.status(200).json({ group });
    return;
  } catch (err) {
    if (err instanceof ValidationError) {
      const sequelizeError: SequelizeError = err;
      res.status(500).json({ error: sequelizeError.errors});
      return;
    } else {
      res.status(500).json({ error: err });
      return;
    }
  }
};


/**
 * Update group details.
 *
 * @param {Request} req - Express request object containing group data in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns updated group details.
 */
export const updateGroupDetails = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    } else if (req.user && req.user.id === group.createdBy) {
      await group.update({
        name: name || group.name,
        description: description || group.description,
      });
      res.status(200).json({ message: "Group updated successfully", group });
      return
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      const sequelizeError: SequelizeError = err;
      res.status(500).json({ error: sequelizeError.errors});
      return;
    } else {
      res.status(500).json({ error: err });
      return;
    }
  }
};

/**
 * Get the currently authenticated users group.
 *
 * @param {Request} req - null
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with group details.
 */
export const getCurrentUserGroups = async (req: Request, res: Response) => {
  try {
    const createdBy = req.user?.id;
    const groups = await Group.findAll({ where: { createdBy } });

    if (!groups.length) {
      res.status(204).json({ message: "No groups found for this user" });
      return;
    }
    res.status(200).json({ groups });
    return;
  } catch (err) {
    if (err instanceof ValidationError) {
      const sequelizeError: SequelizeError = err;
      res.status(500).json({ error: sequelizeError.errors});
      return;
    } else {
      res.status(500).json({ error: err });
      return;
    }
  }
};

/**
 * Delete group by the creator
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with success message.
 */
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByPk(groupId);

    if (!group) {
      res.status(404).json({ message: "Group not found" });
    } else if (req.user && req.user.id === group.createdBy) {
      await group.destroy();
      res.status(200).json({ message: "Group has been deleted."});
      return;
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      const sequelizeError: SequelizeError = err;
      res.status(500).json({ error: sequelizeError.errors});
      return;
    } else {
      res.status(500).json({ error: err });
      return;
    }
  }
};

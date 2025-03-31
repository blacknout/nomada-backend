import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import { SequelizeError } from "../config/sequelize";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";
import User from "../models/User";


/**
 * Join a group.
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */
export const joinGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
    } else {
      const isMember = await GroupMember.findOne({ where: { userId, groupId } });
      if (isMember) {
        res.status(400).json({ message: "User is already in the group" });
      }

      await GroupMember.create({ userId, groupId });

      res.status(200).json({ message: "Successfully joined the group" });
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
 * get group members.
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with group users or error
 */
export const getGroupUsers = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const groupWithUsers = await Group.findOne({
      where: { id: groupId },
      include: {
        model: User,
        as: "users", 
        attributes: ["id", "username", "email"],
      },
    });

    if (!groupWithUsers) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    res.status(200).json({ groupWithUsers });
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
 * Add a user to a group.
 *
 * @param {Request} req - Express request object containing group Id and user Id in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */

export const addUserToGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (req.user && req.user.id === group.createdBy) {
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      const existingMembership = await GroupMember.findOne({ where: { groupId, userId } });
      if (existingMembership) {
        res.status(400).json({ message: "User is already in the group" });
        return;
      } else {
        await GroupMember.create({ groupId, userId });
  
        res.status(201).json({ message: "User added to group successfully" });
        return;
      }
    } else {
      res.status(403).json({ message: "Only admins can add users to this group." });
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


/**
 * Remove a user from a group
 *
 * @param {Request} req - Express request object containing group Id and user Id in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */
export const removeUserFromGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, userId } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    if (req.user && req.user.id === group.createdBy) {
      const membership = await GroupMember.findOne({ where: { groupId, userId } });
      if (!membership) {
        res.status(404).json({ message: "User is not in the group" });
        return;
      }

      await GroupMember.destroy({ where: { groupId, userId } });
      res.status(200).json({ message: "User removed from group successfully" });
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


/**
 * Leave a group
 *
 * @param {Request} req - Express request object containing group Id in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */
export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    } else {
      const membership = await GroupMember.findOne({ where: { groupId, userId } });
      if (!membership) {
        res.status(404).json({ message: "You are not a member of this group" });
        return;
      }

      await GroupMember.destroy({ where: { groupId, userId } });
      res.status(200).json({ message: "You have left the group successfully" });
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
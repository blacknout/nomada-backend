import { Request, Response } from "express";
import errorResponse from "../errors/errorResponse";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";
import User from "../models/User";
import { becomeGroupMember, createInvite, inviteResponse } from "../services/groupServices";


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

    const response = await becomeGroupMember(userId, groupId);
    res.status(response.status).json({ message: response.message });
    return;
  } catch (err) {
    errorResponse(res, err);
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
    errorResponse(res, err);
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

export const inviteUserToGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;
    const { id: senderId } = req.user;

    createInvite(req, res, userIds, groupId, senderId);
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const respondToInvite = async (req: Request, res: Response) => {
  try {
    const { inviteId } = req.params;
    const { response } = req.body;

    inviteResponse(req, res, inviteId, response);
    return;
  } catch (err) {
    errorResponse(res, err);
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
    } else {
      res.status(200).json({ message: "Only the Admin can remove a user from the group." });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
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
    errorResponse(res, err);
  }
};

export const updateGroupMemberType = async (req: Request, res: Response) => {
  try {
    const { groupId, type, userId: updatedUser } = req.body;
    

    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found."});
      return;
    }

    const isCreator = req.user.id === group.createdBy;
    const userId = isCreator ? (updatedUser || req.user.id) : req.user.id;
    
    if (!isCreator && group.isRestricted) {
      res.status(403).json({ message: "You are not allowed to update your member type."});
      return;
    }
    const member = await GroupMember.findOne({ 
      where: {
        groupId,
        userId
      }
    });
    if (!member) {
      res.status(404).json({ message: "This user is not a part of this group."});
      return;
    }
    await member.update({
      type
    });
    res.status(200).json({ message: `This group members' status has been updated to ${type}.` });
  } catch (err) {
    errorResponse(res, err);
  }
};

import { Request, Response } from "express";
import errorResponse from "../errors/errorResponse";
import { GroupMember, Group, Ride, User } from "../models/associations";
import { 
  becomeGroupMember, 
  createInvite, 
  handleInviteResponse 
} from "../services/groupServices";


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
    const { id } = req.params;
    const userId = req.user?.id;

    const response = await becomeGroupMember(userId, id);
    res.status(response.status).json({ message: response.message });
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
    const { id } = req.params;
    const { userIds } = req.body;
    const { id: senderId } = req.user;


    console.log(`Inviting users to group ${groupId}:`, userIds);
    const response = await createInvite(userIds, groupId, senderId);
    
    // Provide more detailed error messages for debugging
    if (response.status !== 200) {
      console.log("Invitation error:", response.message);
    }
    
    res.status(response.status).json({ 
      message: response.message,
      details: response.details || null
    });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const respondToInvite = async (req: Request, res: Response) => {
  try {
    const { inviteId } = req.params;
    const { response: inviteResponse } = req.body;

    const response = await handleInviteResponse(req.user.id, inviteId, inviteResponse);
    res.status(response.status).json({ message: response.message });
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
    const { groupId1, userId } = req.body;

    const group = await Group.findByPk(groupId1);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    if (req.user && req.user.id === group.createdBy) {
      const membership = await GroupMember.findOne({ where: { groupId: groupId1, userId } });
      if (!membership) {
        res.status(404).json({ message: "User is not in the group" });
        return;
      }

      await GroupMember.destroy({ where: { groupId: groupId1, userId } });
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
    const { id: groupId2 } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    } else {
      const membership = await GroupMember.findOne({ where: { groupId: groupId2, userId } });
      if (!membership) {
        res.status(404).json({ message: "You are not a member of this group" });
        return;
      }

      await GroupMember.destroy({ where: { groupId: groupId2, userId } });
      res.status(200).json({ message: "You have left the group successfully" });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

export const updateGroupMemberType = async (req: Request, res: Response) => {
  try {
    const { groupId3, type, userId: updatedUser } = req.body;
    const { id } = req.user;
    const group = await Group.findByPk(groupId3)
    if (!group) {
      res.status(404).json({ message: "Group not found."});
      return;
    }

    const isARoadCaptain = await Ride.findOne({
      where: {
        groupId: groupId3,
        roadCaptainId: id
      }
    })
    const canChangeOthers = id === group.createdBy || Boolean(isARoadCaptain);
    const userId = canChangeOthers ? (updatedUser || id) : id;
    
    if (!canChangeOthers && group.isRestricted) {
      res.status(403).json({ message: "You are not allowed to update your member type."});
      return;
    }
    const member = await GroupMember.findOne({ 
      where: {
        groupId: groupId3,
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

/**
 * Get all members of a specific group
 *
 * @param {Request} req - Express request object containing groupId in req.params
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - Returns JSON response with group members or error
 */
export const getGroupMembersByGroupId = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Find all group members with user details
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'avatar', 'firstname', 'lastname']
        }
      ]
    });

    res.status(200).json({ 
      message: "Group members retrieved successfully", 
      members,
      count: members.length
    });
  } catch (err) {
    errorResponse(res, err);
  }
};

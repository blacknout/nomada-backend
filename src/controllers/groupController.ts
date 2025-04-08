import { Request, Response, NextFunction } from "express";
import errorResponse from "../errors/errorResponse";
import { Op } from "sequelize";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";
import { createGroupWithUsers } from "../services/groupServices";


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
    const { name, description, userIds } = req.body;
    const userId = req.user?.id as string;
    let response = { invited: 0, total: 0}
    const group = await Group.create({
      name: String(name),
      description: description ? String(description) : null,
      createdBy: String(userId),
    });

    if (userIds.length) { response = await createGroupWithUsers(group.id, userIds, userId);}
    await GroupMember.create({ groupId: group.id, userId });
    res.status(201).json({ 
      message: "Group created successfully",
      group,
      invites: `${response?.invited} out of ${response?.total} users invited.` });
  } catch (err) {
    errorResponse(res, err);
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
    errorResponse(res, err);
  }
};

export const searchGroup = async (req: Request, res: Response) => {
  try {

    const { search } = req.query;

    if (!search || typeof search !== "string") {
      res.status(400).json({ message: "A query parameter is required" });
      return;
    }

    const users = await Group.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ], isPrivate: false
      },
      attributes: ["id", "name", "description"],
    });

    if (users.length === 0) {
      res.status(404).json({ message: "No groups found" });
    } else {
      res.status(200).json({ users });
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

export const changeGroupPrivacy = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { privacy } = req.body;

    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.createdBy === req.user.id) {
      group.isPrivate = privacy;
      await group.save();
      res.status(200).json({ message: "Group privacy updated", group });
      return;
    } else {
      res.status(403).json({ message: "You are not allowed to update this group privacy." });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
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
    errorResponse(res, err);
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
    errorResponse(res, err);
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
    errorResponse(res, err);
  }
};

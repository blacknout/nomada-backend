import { Request, Response, NextFunction } from "express";
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
    next(err);
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
    }

    res.status(200).json({ group });
  } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Internal Server Error" });
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
    } else if (req.user && req.user.id === group.createdBy) {
      await group.update({
        name: name || group.name,
        description: description || group.description,
    });

    res.status(200).json({ message: "Group updated successfully", group });
    }

  } catch (error) {
      console.error("Error updating group:", error);
      res.status(500).json({ message: "Internal Server Error" });
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
      res.status(404).json({ message: "No groups found for this user" });
      return;
    }

    res.status(200).json({ groups });
  
  } catch (error) {
      console.error("Error fetching current user's groups:", error);
      res.status(500).json({ message: "Internal Server Error" });
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
    }
  } catch (error) {
      console.error("Error updating bike:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

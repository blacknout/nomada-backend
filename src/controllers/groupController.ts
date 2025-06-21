import { Request, Response, NextFunction } from "express";
import errorResponse from "../errors/errorResponse";
import { Sequelize, Op } from "sequelize";
import { GroupMember, Group, User } from "../models/associations";
import { 
  inviteUsersToGroup,
  checkNameSimilarity
 } from "../services/groupServices";


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
    const { name: potentialName } = req.query;
    const { name, description, userIds } = req.body;
    const { id } = req.user;

    const similarityResponse = potentialName &&
      await checkNameSimilarity(potentialName as string);
    const userId = req.user?.id as string;

    if (similarityResponse) {
      const { status, message } = similarityResponse;
      res.status(status).json({ 
        message
      });
      return
    }

    let response = { invited: 0, total: 0 }
    const group = await Group.create({
      name: String(name),
      description: description ? String(description) : null,
      createdBy: String(userId),
    });
    await group.addGroupAdmin(id);

    if (userIds?.length) { response = await inviteUsersToGroup(group.id, group.name, userIds, userId);}
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
    const { id } = req.params;
    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'username', 'firstname', 'lastname', 'email', 'avatar'],
          through: { attributes: [] },
        },
      ],
    });
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
    res.status(200).json({ users });
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
export const updateGroupData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, privacy: isPrivate, restriction: isRestricted } = req.body;

    const group = await Group.findByPk(id);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    const isCreator = req.user.id === group.createdBy;
    if (isCreator) {
      await group.update({
        name: name || group.name,
        description: description || group.description,
        isPrivate: isPrivate ?? group.isPrivate,
        isRestricted: isRestricted ?? group.isRestricted
      });

      res.status(200).json({ message: "Group updated successfully", group });
      return
    } else {
      res.status(403).json({ message: " You are not permitted to change this groups details." });
      return;
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
    const userId = req.user?.id;
    const groups = await Group.findAll({
      include: [
        {
          model: GroupMember,
          as: 'members',
          attributes: [],
        },
        {
          model: GroupMember,
          as: 'members',
          where: { userId },
          attributes: [],
          required: true,
          duplicating: false,
        },
      ],
      attributes: {
        include: [
          [Sequelize.fn('COUNT', Sequelize.col('members.id')), 'memberCount'],
        ],
      },
      group: ['group.id'],
      subQuery: false,
    });

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
    const { id } = req.params;
    const group = await Group.findByPk(id);

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

export const addGroupAdmin = async (req: Request, res: Response) => {
  try {
    const { userId, id: groupId } = req.params;
    const { id } = req.user;

    const isMember = await GroupMember.findOne({
      where: {
        userId,
        groupId
      }
    });
    if (!isMember) {
      res.status(400).json({ 
        message: "This user is not a member of this group."});
      return;
    }

    const group = await Group.findByPk(groupId, {
      include: [{ model: User, as: 'groupAdmins' }],
    });

    const isAdmin = group?.groupAdmins
    ?.some((admin: any) => admin.id === id);
    
    if (group && isAdmin) {
      await group.addGroupAdmin(userId);
      res.status(200).json({ message: "User has been made an admin."});
      return;
    }
    res.status(400).json({ message: "Unable to make this user an admin."});
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const removeAdmin = async (req: Request, res: Response) => {
  try {
    const { userId, id: groupId } = req.params;
    const { id } = req.user;
    const group = await Group.findByPk(groupId)
    const user = await User.findByPk(userId);

    const isCreator = group.createdBy === id;
    if (user && group && isCreator) {
      await group.removeGroupAdmin(user);
      res.status(200).json({ message: "User has been removed as an admin."});
      return;
    }
    res.status(400).json({ message: "Unable to remove this user as an admin."});
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getGroupAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await Group.findByPk(id);

    const admins = await group.getGroupAdmins();
    res.status(200).json({ 
      admins
    });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

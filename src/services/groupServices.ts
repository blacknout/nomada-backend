import { Request, Response } from "express";
import User  from "../models/User";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";
import GroupInvitation from "../models/GroupInvitation";
import { Op } from "sequelize";

/**
 * Create a new group and invite users during creation.
 * @param {string} name - Name of the group
 * @param {string[]} userIds - List of user IDs to add to the group
 */
export const createGroupWithUsers = async (createdBy: string, name: string, description: string, userIds: string[]) => {
  try {
    const group = await Group.create({ createdBy, name, description });

    const groupAndInvite = await inviteUsersToGroup(group.id, userIds);

    return { groupAndInvite };
  } catch (error) {
    throw new Error(`Error creating group: ${error}`);
  }
};

/**
 * Invite multiple users to an existing group.
 * @param {string} groupId - ID of the group
 * @param {string[]} userIds - List of user IDs to add
 */
export const inviteUsersToGroup = async (groupId: string, userIds: string[]) => {
  try {
    const validUsers = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id"],
    });

    if (!validUsers.length) throw new Error("No valid users found.");

    const groupInvites = validUsers.map((user) => ({
      userId: user.id,
      groupId,
    }));

    const groupPendingInvites = await GroupInvitation.bulkCreate(groupInvites, { ignoreDuplicates: true });

    return { message: "Users invited successfully", groupPendingInvites };
  } catch (error) {
    throw new Error(`Error adding users: ${error}`);
  }
};


export const becomeGroupMember = async (res: Response, userId: string, groupId: string, isInvited: boolean = false) => {
  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
    } else {
      const isMember = await GroupMember.findOne({ where: { userId, groupId } });
      if (isMember) {
        res.status(400).json({ message: "User is already in the group" });
      }
      if (group.isPrivate && !isInvited) {
        res.status(403).json({ message: "You must be invited to this group." });
        return;
      }
      await GroupMember.create({ userId, groupId });
      res.status(200).json({ message: "Successfully joined the group" });
      return;
    }
    } catch (error) {
    throw new Error(`Error adding users: ${error}`);
  }
};

export const createInvite = async (req: Request, res: Response, userId: string, userIds: string[], groupId: string) => {
  const group = await Group.findByPk(groupId);
  if (!group) {
    res.status(404).json({ message: "Group not found" });
    return;
  }
  if (req.user && req.user.id === group.createdBy) {
    if (userIds?.length) {
      const invitations = await inviteUsersToGroup(group.id, userIds);
      res.status(200).json({ message: "Invitations sent", invitations });
      return;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const existingGroupMember = await GroupMember.findOne({ where: { userId, groupId: group.id} });
    if (existingGroupMember) {
      res.status(400).json({ message: "User is already in this group." });
      return;
    }
    const existingInvitation = await GroupInvitation.findOne({ where: { userId, groupId: group.id} });
    if (existingInvitation) {
      res.status(400).json({ message: "User is already invited." });
      return;
    }
    const invitation = await GroupInvitation.create({ userId, groupId: group.id });
    res.status(200).json({ message: "Invitation sent", invitation });
    return;
  } else {
    res.status(403).json({ message: "Only admins can add users to this group." });
    return;
  }
}

export const inviteResponse = async (req: Request, res: Response, inviteId: string, response: string) => {
  const invitation = await GroupInvitation.findByPk(inviteId);
  if (!invitation) {
    res.status(404).json({ message: "Invitation not found" });
    return;
  }

  if (req.user && req.user.id === invitation.userId) {
    if (response === "accepted") {
      await becomeGroupMember(res, invitation.userId, invitation.groupId, true);
    }
    await invitation.destroy();
    res.status(200).json({ message: `The invite has been ${response}.` });
    return;
  } else {
    res.status(400).json({ message: "This invite is not intended for you." });
    return;
  }
}

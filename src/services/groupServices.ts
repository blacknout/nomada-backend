import { Request, Response } from "express";
import User  from "../models/User";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";
import GroupInvitation from "../models/GroupInvitation";
import { Op } from "sequelize";

/**
 * Create a new group and invite users during creation.
 * @param {string} groupId - Id of the group
 * @param {string[]} userIds - List of user IDs to add to the group
 */
export const createGroupWithUsers = async (groupId: string, userIds: string[], sender: string) => {
  try {
    const groupAndInvite = await inviteUsersToGroup(groupId, userIds, sender);
    return groupAndInvite;
  } catch (error) {
    throw new Error(`Error creating group: ${error}`);
  }
};

/**
 * Invite multiple users to an existing group.
 * @param {string} groupId - ID of the group
 * @param {string[]} userIds - List of user IDs to add
 */
export const inviteUsersToGroup = async (groupId: string, userIds: string[], senderId: string) => {
  try {
    const validUsers = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id"],
    });

    if (!validUsers.length) throw new Error("No valid users found.");

    const alreadyInvited = await GroupInvitation.findAll({
      where: {
        groupId,
        userId: userIds,
      },
      attributes: ['userId'],
    });

    const alreadyInvitedIds = new Set(alreadyInvited.map(invite => invite.userId));

    // remove users that have already been invited to the group
    const groupInvites = validUsers
    .filter((user) => !alreadyInvitedIds.has(user.id))
    .filter((user) => user.id !== senderId)
    .map((user) => ({
      userId: user.id,
      groupId,
      senderId
    }));

    const groupPendingInvites = await GroupInvitation.bulkCreate(groupInvites, { ignoreDuplicates: true });

    return { invited: groupPendingInvites.length, total: userIds.length};
  } catch (error) {
    throw new Error(`Error adding users: ${error}`);
  }
};


export const becomeGroupMember = async (userId: string, groupId: string, isInvited: boolean = false) => {
  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      // res.status(404).json({ message: "Group not found" });
      return { status: 404, message: "Group not found" };
    } else if (group.isPrivate && !isInvited) {
      // res.status(404).json({ message: "You must be invited to join this group" });
      return { status: 404, message: "You must be invited to join this group" };
      return;
    } else {
      console.log("-------------------------------------", userId, groupId)
      const isMember = await GroupMember.findOne({ where: { userId, groupId } });
      console.log("is member-----------------", isMember)
      if (isMember) {
        // res.status(400).json({ message: "User is already in the group" });
        return { status: 400,  message: "User is already in the group" };
      }
      await GroupMember.create({ userId, groupId });
      // res.status(200).json({ message: "Successfully joined the group" });
      return { status: 200, message: "The invite has been accepted."};
      return;
    }
  } catch (error) {
    throw new Error(`Error adding users: ${error}`);
  }
};

export const createInvite = async (req: Request, res: Response, userIds: string[], groupId: string, sender: string) => {
  const isGroupMember = await GroupMember.findOne({
    where: {
      userId: sender,
      groupId
    }
  })
  if (!isGroupMember) {
    res.status(404).json({ message: "You are not a member of this group or this group does not exist." });
    return;
  } 
  const invitations = await inviteUsersToGroup(groupId, userIds, sender);
  res.status(200).json({ 
    message: `${invitations?.invited} out of ${invitations?.total} users invited.`
  });
  return;
}

export const inviteResponse = async (req: Request, res: Response, inviteId: string, response: string) => {
  const invitation = await GroupInvitation.findByPk(inviteId);
  if (!invitation) {
    res.status(404).json({ message: "Invitation not found" });
    return;
  }

  let data = { status: 200, message: "This invite has been rejected."};
  if (req.user.id === invitation.userId) {
    if (response === "accepted") {
      data = await becomeGroupMember(invitation.userId, invitation.groupId, true);
    } 
    await invitation.destroy();
    res.status(data.status).json({ message: data.message });
    return;
  } else {
    res.status(400).json({ message: "This invite is not intended for you." });
    return;
  }
}

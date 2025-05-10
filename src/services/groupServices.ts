import User  from "../models/User";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";
import Notification from "../models/Notification";
import { notification } from "../utils/constants/notifications";
import { Op } from "sequelize";
import { 
  NotificationType,
  NotificationPriority,
} from '../@types/model';

/**
 * Invite multiple users to an existing group.
 * @param {string} groupId - ID of the group
 * @param {string[]} userIds - List of user IDs to add
 */
export const inviteUsersToGroup = async (groupId: string, groupName:string, userIds: string[], senderId: string) => {
  try {
    const { username: senderName } = await User.findByPk(senderId);
    const validUsers = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id"],
    });

    if (!validUsers.length) throw new Error("No valid users found.");

    const alreadyInvited = await Notification.findAll({
      where: {
        userId: userIds,
        type: "invite",
        data: {
          groupId,
        }
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
      title: notification.GROUP_INVITE,
      priority: "low" as NotificationPriority,
      type: "invite" as NotificationType,
      message: notification.GROUP_INVITE_MESSAGE,
      data: {
        type: "invite",
        groupId,
        groupName,
        senderId,
        senderName
      }
    }));

    const groupPendingInvites = await Notification.bulkCreate(groupInvites, { ignoreDuplicates: true });

    return { invited: groupPendingInvites.length, total: userIds.length};
  } catch (error) {
    throw new Error(`Error adding users: ${error}`);
  }
};

export const becomeGroupMember = async (
  userId: string,
  groupId: string,
  isInvited: boolean = false
) => {
  try {
    const group = await Group.findByPk(groupId);

    if (!group) {
      return { status: 404, message: "Group not found" };
    }

    if (group.isPrivate && !isInvited) {
      return { status: 403, message: "You must be invited to join this private group" };
    }

    const isMember = await GroupMember.findOne({ where: { userId, groupId } });

    if (isMember) {
      return { status: 400, message: "User is already in the group" };
    }

    await GroupMember.create({ userId, groupId });

    return { status: 200, message: `You have been added to ${group.name}.` };
  } catch (error) {
    console.error("Error adding group member:", error);
    return { status: 500, message: "Internal server error" };
  }
};

export const createInvite = async (userIds: string[], groupId: string, sender: string) => {
  try {
    const groupMember = await GroupMember.findOne({
      where: {
        userId: sender,
        groupId
      },
      include: [
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name'],
        },
      ],
    }) as GroupMember & { group: Group }
    if (!groupMember) {
      return { 
        status: 404,
        message: "You are not a member of this group or this group does not exist." };
    }
    const invitations = await inviteUsersToGroup(
      groupId, groupMember.group.name, userIds, sender
    );
    return { 
      status: 200,
      message: `${invitations?.invited} out of ${invitations?.total} users invited.`
    }
  } catch (error) {
    console.error("Error adding group member:", error);
    return { status: 500, message: "Internal server error" };
  }
}

export const handleInviteResponse = async (
  userId: string,
  inviteId: string,
  response: string
) => {
  try {
    const invitation = await Notification.findOne({
      where: {
        type: "invite",
        data: { inviteId },
      },
    });
  
    if (!invitation) {
      return {
        status: 404,
        message: "Invitation not found",
      };
    }
  
    if (userId !== invitation.userId) {
      return {
        status: 400,
        message: "This invite is not intended for you.",
      };
    }
  
    let result = {
      status: 200,
      message: "This invite has been rejected.",
    };
  
    if (response === "accepted") {
      result = await becomeGroupMember(userId, invitation.data.groupId, true);
    }
  
    await invitation.destroy();
  
    return result;
  } catch (error) {
    console.error("Error adding group member:", error);
    return { status: 500, message: "Internal server error" };
  }
};

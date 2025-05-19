import User  from "../models/User";
import Group from "../models/Group";
import GroupMember from "../models/GroupMembers";
import Notification from "../models/Notification";
import { notification } from "../utils/constants/notifications";
import { 
  GROUP_NAME_CLASH, 
  LEVENSHTEIN_THRESHOLD,
  ALLOWED_GROUP_NAME
 } from "../utils/constants/constants";
import { Op } from "sequelize";
import { 
  NotificationType,
  NotificationPriority,
} from '../@types/model';
import logger from '../utils/logger';
import { levenshtein } from "../utils/calc";
import { skippedKeywords } from "../utils/constants/groupNameKeywords";
import { sendNotificationToUser } from "./notificationService";

type SimilarityResult = {
  status: number;
  message: string;
} | undefined;

/**
 * Invite multiple users to an existing group.
 * @param {string} groupId - ID of the group
 * @param {string} groupName - Name of the group
 * @param {string[]} userIds - List of user IDs to add
 * @param {string} senderId - ID of the user sending invitations
 * @returns {Object} Result with invited and total counts, and skipped users info
 */
export const inviteUsersToGroup = async (groupId: string, groupName: string, userIds: string[], senderId: string) => {
  try {
    // Skip empty user lists
    if (!userIds || userIds.length === 0) {
      return { invited: 0, total: 0, skippedUsers: [] };
    }

    // Get sender info
    const sender = await User.findByPk(senderId, {
      attributes: ["id", "username"]
    });
    
    if (!sender) {
      throw new Error("Sender not found");
    }

    // Find all valid users from the input user IDs
    const validUsers = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "username", "pushToken"],
    });

    if (!validUsers.length) {
      return { invited: 0, total: userIds.length, skippedUsers: userIds, reason: "No valid users found" };
    }

    // Find users that have already been invited to this group
    const alreadyInvited = await Notification.findAll({
      where: {
        userId: { [Op.in]: userIds },
        type: "invite",
        data: {
          groupId,
        }
      },
      attributes: ['userId'],
    });

    const alreadyInvitedIds = new Set(alreadyInvited.map(invite => invite.userId));
    
    interface SkippedUser {
      id: string;
      username: string;
      reason: string;
    }
    
    const skippedUsers: SkippedUser[] = [];

    // Create notification objects for valid invitations
    const groupInvites = validUsers
      .filter((user) => {
        // Skip users who have already been invited
        if (alreadyInvitedIds.has(user.id)) {
          skippedUsers.push({ id: user.id, username: user.username, reason: "already invited" });
          return false;
        }
        
        // Skip the sender (can't invite yourself)
        if (user.id === senderId) {
          skippedUsers.push({ id: user.id, username: user.username, reason: "cannot invite yourself" });
          return false;
        }

        // Skip users without push tokens
        if (!user.pushToken) {
          skippedUsers.push({ id: user.id, username: user.username, reason: "no push token" });
          return false;
        }
        
        return true;
      })
      .map((user) => {
        const message = notification.GROUP_INVITE_MESSAGE(sender.username, groupName);
        logger.info(`Creating invitation for user ${user.username} (${user.id}) with message: ${message}`);
        
        return {
          userId: user.id,
          title: notification.GROUP_INVITE,
          priority: "low" as NotificationPriority,
          type: "invite" as NotificationType,
          message,
          data: {
            type: "invite",
            groupId,
            groupName,
            senderId,
            senderName: sender.username
          }
        };
      });

    // Log detailed information for debugging
    if (skippedUsers.length > 0) {
      logger.info(`Skipped ${skippedUsers.length} users:`, JSON.stringify(skippedUsers));
    }
    
    // Create the invitations and send push notifications
    let createdInvites = [];
    if (groupInvites.length > 0) {
      try {
        createdInvites = await Notification.bulkCreate(groupInvites, { 
          ignoreDuplicates: true,
          returning: true
        });
        
        // Send push notifications for each created invitation
        for (const invite of createdInvites) {
          console.log("🚀 ~ inviteUsersToGroup ~ invite:", JSON.stringify(invite));
          try {
            logger.info(`Attempting to send push notification to user ${invite.userId}`);
            const result = await sendNotificationToUser(
              invite.userId,
              invite.title,
              invite.message,
              invite.data,
              undefined,
              "normal"
            );
            
            if (result) {
              logger.info(`Successfully sent push notification to user ${invite.userId}`);
            } else {
              logger.warn(`Failed to send push notification to user ${invite.userId} - no result returned`);
            }
          } catch (error) {
            logger.error(`Failed to send push notification to user ${invite.userId}:`, error);
          }
        }
      } catch (error) {
        logger.error(`Error creating invitations:`, error);
      }
    } else {
      logger.info(`No invitations to create after filtering`);
    }

    return { 
      invited: createdInvites.length, 
      total: userIds.length,
      skippedUsers 
    };
  } catch (error) {
    logger.error("Error in inviteUsersToGroup:", error);
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
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return { 
        status: 400,
        message: "No valid user IDs provided",
        details: { error: "EMPTY_USER_IDS" }
      };
    }

    // Check if group exists and sender is a member
    const groupMember = await GroupMember.findOne({
      where: {
        userId: sender,
        groupId
      },
      include: [
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'isPrivate', 'isRestricted'],
        },
      ],
    }) as GroupMember & { group: Group }

    if (!groupMember) {
      return { 
        status: 404,
        message: "You are not a member of this group or this group does not exist.",
        details: { error: "NOT_GROUP_MEMBER" }
      };
    }

    // Check if users already in group
    const existingMembers = await GroupMember.findAll({
      where: {
        groupId,
        userId: { [Op.in]: userIds }
      },
      attributes: ['userId']
    });

    const alreadyMemberIds = existingMembers.map(member => member.userId);
    const filteredUserIds = userIds.filter(id => !alreadyMemberIds.includes(id));

    if (filteredUserIds.length === 0) {
      return { 
        status: 400,
        message: "All users are already members of this group",
        details: { 
          error: "ALL_ALREADY_MEMBERS",
          alreadyMembers: alreadyMemberIds 
        }
      };
    }

    // Now attempt to create invitations
    const invitations = await inviteUsersToGroup(
      groupId, groupMember.group.name, filteredUserIds, sender
    );

    // More detailed response message
    if (invitations?.invited === 0) {
      let message = "No users were invited.";
      
      if (alreadyMemberIds.length > 0) {
        message += ` ${alreadyMemberIds.length} users are already members.`;
      }
      
      return {
        status: 400,
        message,
        details: {
          error: "NO_INVITATIONS_CREATED",
          skippedUsers: invitations.skippedUsers,
          alreadyMembers: alreadyMemberIds
        }
      };
    }

    return { 
      status: 200,
      message: `${invitations?.invited} out of ${invitations?.total} users invited.`,
      details: {
        invited: invitations?.invited,
        total: invitations?.total,
        skippedUsers: invitations?.skippedUsers,
        alreadyMembers: alreadyMemberIds
      }
    };
  } catch (error) {
    return { 
      status: 500, 
      message: "Internal server error",
      details: { error: String(error) }
    };
  }
}

export const handleInviteResponse = async (
  userId: string,
  id: string,
  response: string
) => {
  try {
    const invitation = await Notification.findOne({
      where: {
        type: "invite",
        id,
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

export const checkNameSimilarity = async(name: string): Promise<SimilarityResult> => {
  try {
    const groupNameSplit = 
      name
      .toLowerCase()
      .split(" ")
      .filter(word => word.length > 2)
      .filter(word => !skippedKeywords.includes(word))
      .filter(word => word.slice(0, 3))

    const whereClause = {
      [Op.or]: groupNameSplit.map(word => ({
        name: {
          [Op.iLike]: `%${word}%`,
        },
      })),
    };

    const partiallyMatchedGroups = await Group.findAll({
      where: whereClause
    });

    for (let match of partiallyMatchedGroups) {
      const levenshteinDistance = levenshtein(
        match.name.toLowerCase(), name.toLowerCase()
      );
  
      if (levenshteinDistance < LEVENSHTEIN_THRESHOLD) {
        return {
          status: 400,
          message: GROUP_NAME_CLASH
        }
      }
    }
    return {
      status: 200,
      message: ALLOWED_GROUP_NAME
    }
  } catch (error) {
    logger.error('Error checking name avaiability', error);
    return {
      status: 500,
      message: `Error checking name avaiability ${error}`
    }
  }
}
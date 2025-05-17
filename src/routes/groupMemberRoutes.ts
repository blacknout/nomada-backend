import express from "express";
import {
  joinGroup,
  inviteUserToGroup,
  respondToInvite,
  removeUserFromGroup,
  leaveGroup,
  updateGroupMemberType,
  getGroupMembersByGroupId
} from "../controllers/groupMemberController";
import {
  validateGroupQuery,
  validateInviteToGroup,
  validateRespondToInvite,
  validateMemberStatus,
  validateUserGroup
} from "../middleware/groupValidation";
import {
  validateUserQuery
} from "../middleware/userValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();

/**
 * @swagger
 * /api/member/{groupId}/join:
 *   post:
 *     summary: Join a group
 *     description: A user joins the group in params
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: The ID of the group to join.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined the group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully joined the group
 *                 user:
 *                   $ref: '#/components/schemas/GroupMember'
 *       400:
 *         description: User is already in the group
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/join", 
  authenticateUser, 
  validateGroupQuery, 
  joinGroup
);

/**
 * @swagger
 * /api/member/{groupId}/invite:
 *   post:
 *     summary: Invite a user or users to a group
 *     description: A user or multiple users are invited to join a group
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - userIds
 *             properties:
 *               groupId:
 *                 type: string
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Invitation sent
 *       400:
 *         description: User already invited or user already in this group.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       403:
 *         description: Only admins can add users to this group.
 *       404:
 *         description: User not found or Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/invite",
  authenticateUser,
  validateGroupQuery,
  validateInviteToGroup,
  inviteUserToGroup);


/**
 * @swagger
 * /api/member/{inviteId}/respond:
 *   post:
 *     summary: Respond to an invite request
 *     description: A user responds to an invite request
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invite
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 enum: ["accepted", "rejected"]
 *                 example: "pending"
 *     responses:
 *       200:
 *         description: The invite has been accepted or rejected
 *       400:
 *         description: This invite is not intended for you.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Internal server error
 */
router.post("/:inviteId/respond",
  authenticateUser,
  validateRespondToInvite,
  respondToInvite);
  
/**
 * @swagger
 * /api/member/remove-user:
 *   post:
 *     summary: Remove a user from a group
 *     description: This removes a user from a group
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - userId
 *             properties:
 *               groupId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User removed from group successfully
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: User is not in the group or Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/remove-user", 
  authenticateUser,
  validateUserGroup,
  removeUserFromGroup);


/**
 * @swagger
 * /api/member/leave-group/{groupId}:
 *   delete:
 *     summary: Leave a group
 *     description: This will make the authenticated user exit a group
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         description: The Group ID to be deleted
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             groupId:
 *               type: string
 *               example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: You have left the group successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: You are not a member of this group
 *       500:
 *         description: Internal server error
 */
router.delete("/leave-group/:id", 
  authenticateUser, 
  validateGroupQuery,
  leaveGroup);


/**
 * @swagger
 * /api/member/type:
 *   put:
 *     summary: Update member type
 *     description: This will update the group member type
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - groupId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["active", "ghost", "observer", "inactive"]
 *               groupId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: This group members' status has been updated to ${type}.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You are not allowed to update your member type.
 *       404:
 *         description: User not found | Group not found.
 *       500:
 *         description: Internal server error
 */
router.put("/type", 
  authenticateUser, 
  validateMemberStatus,
  updateGroupMemberType);

/**
 * @swagger
 * /api/member/{groupId}/users:
 *   get:
 *     summary: Get all members of a specific group
 *     description: Retrieve all users who are members of the specified group
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: The ID of the group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group members retrieved successfully
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       groupId:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [active, ghost, observer, inactive]
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           profilePicture:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.get("/:groupId/users", authenticateUser, validateGroupQuery, getGroupMembersByGroupId);

export default router;

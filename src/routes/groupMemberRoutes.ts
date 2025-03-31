import express from "express";
import {
  joinGroup,
  getGroupUsers,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup
} from "../controllers/groupMemberController";
import {
  validateGroupQuery,
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
router.post("/:groupId/join", authenticateUser, validateGroupQuery, joinGroup);

/**
 * @swagger
 * /api/member/{groupId}/users:
 *   get:
 *     summary: Get all the users in the group
 *     tags:
 *       - Members
 *     parameters:
 *       - in: query
 *         name: groupId
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The group users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Group not found
 *       500:
 *          description: Internal Server Error
 */
router.get("/:groupId/users", authenticateUser, validateGroupQuery, getGroupUsers);

/**
 * @swagger
 * /api/member/add-user:
 *   post:
 *     summary: Add a user to a group
 *     description: A user is added to the group
 *     tags:
 *       - Members
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
 *       201:
 *         description: User added to group successfully
 *       400:
 *         description: User is already in the group
 *       401:
 *         description: Access Denied. No Token Provided.
 *       403:
 *         description: You are not allowed to add users to this group.
 *       404:
 *         description: User not found or Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/add-user",
  authenticateUser,
  validateUserQuery,
  validateGroupQuery,
  addUserToGroup);

/**
 * @swagger
 * /api/member/remove-user:
 *   post:
 *     summary: Remove a user from a group
 *     description: This removes a user from a group
 *     tags:
 *       - Members
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
  validateUserQuery,
  validateGroupQuery,
  removeUserFromGroup);


/**
 * @swagger
 * /api/member/leave-group/{groupId}:
 *   delete:
 *     summary: Leave a group
 *     description: This will make the authenticated user exit a group
 *     tags:
 *       - Members
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
router.delete("/leave-group/:groupId", 
  authenticateUser, 
  validateGroupQuery,
  leaveGroup);


export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groupMemberController_1 = require("../controllers/groupMemberController");
const groupValidation_1 = require("../middleware/groupValidation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
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
router.post("/:groupId/join", auth_1.authenticateUser, groupValidation_1.validateGroupQuery, groupMemberController_1.joinGroup);
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
 *       404:
 *         description: Group not found
 *       500:
 *          description: Internal Server Error
 */
router.get("/:groupId/users", auth_1.authenticateUser, groupValidation_1.validateGroupQuery, groupMemberController_1.getGroupUsers);
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
 *         description: You are not allowed to add users to this group.
 *       404:
 *         description: User not found or Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/add-user", auth_1.authenticateUser, groupMemberController_1.addUserToGroup);
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
 *       404:
 *         description: User is not in the group or Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/remove-user", auth_1.authenticateUser, groupMemberController_1.removeUserFromGroup);
/**
 * @swagger
 * /api/member/leave-group:
 *   post:
 *     summary: Leave a group
 *     description: This will make the authenticated user exit a group
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
 *             properties:
 *               groupId:
 *                 type: string
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
router.post("/leave-group", auth_1.authenticateUser, groupMemberController_1.leaveGroup);
exports.default = router;

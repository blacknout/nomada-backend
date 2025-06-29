import express from "express";
import {
  createGroup,
  getGroup,
  searchGroup,
  updateGroupData,
  getCurrentUserGroups,
  deleteGroup,
  addGroupAdmin,
  removeAdmin,
  getGroupAdmin
} from "../controllers/groupController";
import { 
  validateGroupInfo,
  validateGroupQuery,
  validateGroupUpdate
} from "../middleware/groupValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();

/**
 * @swagger
 * /api/group/:
 *   post:
 *     summary: Create a group
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               userIds:
 *                 type: array
 *     responses:
 *       201:
 *         description: Group created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/", authenticateUser, validateGroupInfo, createGroup);

/**
 * @swagger
 * /api/group/me:
 *   get:
 *     summary: Get all the groups the current user is part of
 *     tags:
 *       - Group
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All the groups the current user is in with member count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 isPrivate:
 *                   type: boolean
 *                 isRestricted:
 *                   type: boolean
 *                 createdBy:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: No groups found for this user
 *       500:
 *          description: Internal Server Error
 */
router.get("/me", authenticateUser, getCurrentUserGroups);

/**
 * @swagger
 * /api/group/{groupId}:
 *   get:
 *     summary: Get details of a group by Id
 *     tags:
 *       - Group
 *     parameters:
 *       - in: query
 *         name: groupId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Group details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: Group ID is required
 *       404:
 *         description: Group not found
 *       500:
 *          description: Internal Server Error
 */
router.get("/:id", authenticateUser, validateGroupQuery, getGroup);


/**
 * @swagger
 * /api/group/:
 *   get:
 *     summary: Search group by name or description
 *     description: Returns a list of groups matching the search query.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: true
 *         description: group name to search for
 *     responses:
 *       200:
 *         description: List of groups matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       400:
 *         description: A query parameter is required
 *       404:
 *         description: No groups found
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateUser, searchGroup);

/**
 * @swagger
 * /api/group/{groupId}:
 *   put:
 *     summary: Update group details
 *     description: Updates the details of a group by their ID. Only group creators can update.
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema :
 *            type: string
 *         description: The ID of the group to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Group Name"
 *               description:
 *                 type: string
 *                 example: "Updated group description"
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Group ID is required
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", 
  authenticateUser, 
  validateGroupUpdate, 
  validateGroupQuery,
  updateGroupData
);

/**
 * @swagger
 * /api/group/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     description: This deletes a group
 *     tags:
 *       - Group
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
 *         description: The group will be deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Group has been deleted.
 *                 bike:
 *                   $ref: '#/components/schemas/Group'
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Group not found
 *       400:
 *         description: Group ID is required
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", 
  authenticateUser, 
  validateGroupQuery,
  deleteGroup
);


/**
 * @swagger
 * /api/group/{id}/user/{userId}:
 *   post:
 *     summary: Add a group admin
 *     tags:
 *       - Group
 *     parameters:
 *       - in: query
 *         name: id
 *       - in: query
 *         name: userId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User has been made an admin.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: This user is not a member of this group.
 *       500:
 *         description: Internal server error
 */
router.post("/:id/user/:userId", 
  authenticateUser, 
  validateGroupQuery, 
  addGroupAdmin
);

/**
 * @swagger
 * /api/group/{id}/admin:
 *   get:
 *     summary: Get group admins
 *     tags:
 *       - Group
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: admins
 *       401:
 *         description: Access Denied. No Token Provided.
 *       500:
 *         description: Internal server error
 */
router.get("/:id/admin", 
  authenticateUser, 
  validateGroupQuery, 
  getGroupAdmin
);

/**
 * @swagger
 * /api/group/{id}/user/{userId}:
 *   delete:
 *     summary: Remove a group admin
 *     description: Remove users as group admins
 *     tags:
 *       - Group
 *     parameters:
 *       - in: query
 *         name: id
 *       - in: query
 *         name: userId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User has been made an admin.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: This user is not a member of this group.
 *       500:
 *         description: Internal server error
 */
router.delete("/:id/user/:userId", 
  authenticateUser, 
  validateGroupQuery, 
  removeAdmin
);

export default router;

import express from "express";
import { 
  createSosContact,
  updateSosContact,
  getSosContacts,
  contactSos,
  rejectSos,
  getAssignedSos,
  removeSosContact
} from "../controllers/sosController";
import {
  validateSosInputs,
  validateSosQuery,
  validateContactSosInputs
} from "../middleware/sosValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();

/**
 * @swagger
 * /api/sos/:
 *   post:
 *     summary: Create an sos contact
 *     tags:
 *       - Sos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactId:
 *                 type: string
 *               contactName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: SOS contact has been created.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         This account no longer exists.
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/", authenticateUser, validateSosInputs, createSosContact);

/**
 * @swagger
 * /api/sos/{id}:
 *   put:
 *     summary: Update an sos contact
 *     tags:
 *       - Sos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactId:
 *                 type: string
 *               contactName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               isActivated:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: SOS contact has been updated.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         Cannot get user or the SOS contact.
 *       500:
 *         description: Internal server error
 * 
 */
router.put("/:id", authenticateUser, validateSosInputs, updateSosContact);

/**
 * @swagger
 * /api/sos/contacts:
 *   get:
 *     summary: Get every sos you have been assigned to by others
 *     tags:
 *       - Sos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SOS contact.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         Cannot get user or the SOS contact.
 *       500:
 *         description: Internal server error
 * 
 */
router.get("/contacts", authenticateUser, getAssignedSos);

/**
 * @swagger
 * /api/sos/:
 *   get:
 *     summary: Get all your sos contacts
 *     tags:
 *       - Sos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SOS contact.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         Cannot get user or the SOS contact.
 *       500:
 *         description: Internal server error
 * 
 */
router.get("/", authenticateUser, getSosContacts);

/**
 * @swagger
 * /api/sos/contact:
 *   post:
 *     summary: initiate an SOS to contacts
 *     tags:
 *       - Sos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               currentRide:
 *                 type: string
 *               location:
 *                 type: object
 *                 description: The GPS location of the sos.
 *     responses:
 *       201:
 *         description: SOS contact has been created.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         This account no longer exists.
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/contact", authenticateUser, validateContactSosInputs, contactSos);

/**
 * @swagger
 * /api/sos/{id}:
 *   delete:
 *     summary: Reject an sos request
 *     tags:
 *       - Sos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: You have been removed as the SOS contact for this user.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         It seems you are not the contact ID for this SOS.
 *       500:
 *         description: Internal server error
 * 
 */
router.delete("/:id", authenticateUser, validateSosQuery, rejectSos);

/**
 * @swagger
 * /api/sos/contact/{id}:
 *   delete:
 *     summary: Remove a contact from SOS
 *     tags:
 *       - Sos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the contact to remove
 *     responses:
 *       200:
 *         description: SOS contact has been removed successfully.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: SOS contact not found or you don't have permission to remove it.
 *       500:
 *         description: Internal server error
 */
router.delete("/contact/:id", authenticateUser, validateSosQuery, removeSosContact);

export default router;
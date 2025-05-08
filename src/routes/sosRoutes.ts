import express from "express";
import { 
  createSosContact,
  updateSosContact,
  getOwnSos,
  contactSos,
  rejectSos,
  getAllSos,
  removeSosContact
} from "../controllers/sosController";
import {
  validateSosInputs
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
 * /api/sos/:
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
router.put("/", authenticateUser, validateSosInputs, updateSosContact);

router.get("/contacts", authenticateUser, getAllSos);

/**
 * @swagger
 * /api/sos/:
 *   get:
 *     summary: Get an sos contact
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
router.get("/", authenticateUser, getOwnSos);

router.post("/contact", authenticateUser, validateSosInputs, contactSos);


router.delete("/:id", authenticateUser, rejectSos);

/**
 * @swagger
 * /api/sos/contact/{contactId}:
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
router.delete("/contact/:id", authenticateUser, removeSosContact);

export default router;
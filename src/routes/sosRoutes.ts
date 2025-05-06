import express from "express";
import { 
  createSosContact,
  updateSosContact,
  getOwnSos,
  contactSos,
  rejectSos,
  getAllSos
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


export default router;
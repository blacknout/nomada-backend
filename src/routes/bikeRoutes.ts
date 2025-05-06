import express from "express";
import {
  createBike,
  getBike,
  updateBike,
  getUserBikes,
  getCurrentUserBikes,
  removeBike,
  searchByVin
} from "../controllers/bikeController";
import {
  validateCreateBike,
  validateUpdateBike,
  validateBikeQuery,
  validateVinQuery
} from "../middleware/bikeValidation";
import {
  validateUserQuery
} from "../middleware/userValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();


/**
 * @swagger
 * /api/bike/:
 *   post:
 *     summary: Create a bike
 *     tags:
 *       - Bike
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *             properties:
 *               plate:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: string
 *               vin:
 *                 type: string
 *               images:
 *                 type: array
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bike created successfully.
 *       401:
 *         description: Access Denied. No Token Provided.
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/", authenticateUser, validateCreateBike, createBike);

/**
 * @swagger
 * /api/bike/search:
 *   get:
 *     summary: Search bikes by vin
 *     tags:
 *       - Bike
 *     parameters:
 *       - in: query
 *         name: vin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bike details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 plate:
 *                   type: string
 *                 make:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: string
 *                 vin:
 *                   type: string
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: VIN contains invalid characters | VIN must be exactly 17 characters
 *       500:
 *          description: Internal Server Error
 */
router.get("/search", authenticateUser, validateVinQuery, searchByVin);

/**
 * @swagger
 * /api/bike/{bikeId}:
 *   get:
 *     summary: Get details of a bike by bikeId
 *     tags:
 *       - Bike
 *     parameters:
 *       - in: query
 *         name: bikeId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bike details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 plate:
 *                   type: string
 *                 make:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: string
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: Bike ID is required
 *       500:
 *          description: Internal Server Error
 */
router.get("/:bikeId", authenticateUser, validateBikeQuery, getBike);


/**
 * @swagger
 * /api/bike/{bikeId}:
 *   put:
 *     summary: Update bike details
 *     description: Updates the details of a bike by their ID. Authenticated users can only update their own bike.
 *     tags:
 *       - Bike
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         required: true
 *         description: The ID of the bike to update.
 *         schema:
 *           type: string
 *       - in: body
 *         name: bike
 *         description: Fields to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             plate:
 *               type: string
 *               example: Bad Sar 44
 *             make:
 *               type: string
 *               example: BMW
 *             model:
 *               type: string
 *               example: GS 1250
 *             year:
 *               type: string
 *               example: 2015
 *             vin:
 *               type: string
 *             stolen:
 *               type: boolean
 *             images:
 *                type: array
 *     responses:
 *       200:
 *         description: Bike updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bike updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/Bike'
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: Bike ID is required
 *       404:
 *         description: Bike not found
 *       500:
 *         description: Internal server error
 */
router.put("/:bikeId", 
  authenticateUser, 
  validateBikeQuery,
  validateUpdateBike,
  updateBike
);

/**
 * @swagger
 * /api/bike/{userId}/bikes:
 *   get:
 *     summary: Get bikes created by user
 *     tags:
 *       - Bike
 *     parameters:
 *       - in: query
 *         name: userId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bikes for the user that notInUse is false
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 plate:
 *                   type: string
 *                 make:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: string
 *       400:
 *         description: User ID is required
 *       401:
 *         description: Access Denied. No Token Provided.
 *       500:
 *          description: Internal Server Error
 */
router.get("/:userId/bikes", authenticateUser, validateUserQuery, getUserBikes);

/**
 * @swagger
 * /api/bike/:
 *   get:
 *     summary: Get bikes created by current user
 *     tags:
 *       - Bike
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All bikes for the logged in user that notInUse is false
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 plate:
 *                   type: string
 *                 make:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: string
 *       400:
 *         description: User ID is required
 *       401:
 *         description: Access Denied. No Token Provided.
 *       500:
 *          description: Internal Server Error
 */
router.get("/", authenticateUser, getCurrentUserBikes);

/**
 * @swagger
 * /api/bike/:
 *   delete:
 *     summary: Remove a bike from user profile
 *     description: This sets a bike to notInUse
 *     tags:
 *       - Bike
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bikeId
 *         description: The bike ID
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             bikeId:
 *               type: string
 *               example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: The bike will be set to not in use.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bike has been removed.
 *                 bike:
 *                   $ref: '#/components/schemas/Bike'
 *       404:
 *         description: Bike not found
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: Bike ID is required
 *       500:
 *         description: Internal server error
 */
router.delete("/:bikeId", authenticateUser, validateBikeQuery, removeBike);

export default router;

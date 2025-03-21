"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bikeController_1 = require("../controllers/bikeController");
const bikeValidation_1 = require("../middleware/bikeValidation");
const userValidation_1 = require("../middleware/userValidation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/bike/:
 *   post:
 *     summary: Create a bike
 *     tags:
 *       - Bike
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plateNumber
 *               - make
 *               - model
 *               - year
 *             properties:
 *               plateNumber:
 *                 type: string
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bike created successfully.
 *       500:
 *         description: Internal server error
 *
 */
router.post("/", auth_1.authenticateUser, bikeValidation_1.validateBikeInfo, bikeController_1.createBike);
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
 *       - BearerAuth: []
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
 *                 plateNumber:
 *                   type: string
 *                 make:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Bike ID is required
 *       404:
 *         description: Bike not found
 *       500:
 *          description: Internal Server Error
 */
router.get("/:bikeId", auth_1.authenticateUser, bikeValidation_1.validateBikeQuery, bikeController_1.getBike);
/**
 * @swagger
 * /api/bike/{bikeId}:
 *   put:
 *     summary: Update bike details
 *     description: Updates the details of a bike by their ID. Authenticated users can only update their own bike.
 *     tags:
 *       - Bike
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
 *             plateNumber:
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
 *       400:
 *         description: Bike ID is required
 *       404:
 *         description: Bike not found
 *       500:
 *         description: Internal server error
 */
router.put("/:bikeId", auth_1.authenticateUser, bikeValidation_1.validateBikeQuery, bikeValidation_1.validateBikeInfo, bikeController_1.updateBike);
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
 *       - BearerAuth: []
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
 *                 plateNumber:
 *                   type: string
 *                 make:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: string
 *       400:
 *         description: User ID is required
 *       404:
 *         description: No bikes found for this user
 *       500:
 *          description: Internal Server Error
 */
router.get("/:userId/bikes", auth_1.authenticateUser, userValidation_1.validateUserQuery, bikeController_1.getUserBikes);
/**
 * @swagger
 * /api/bike/userbike:
 *   get:
 *     summary: Get bikes created by current user
 *     tags:
 *       - Bike
 *     security:
 *       - BearerAuth: []
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
 *                 plateNumber:
 *                   type: string
 *                 make:
 *                   type: string
 *                 model:
 *                   type: string
 *                 year:
 *                   type: string
 *       400:
 *         description: User ID is required
 *       404:
 *         description: No bikes found for this user
 *       500:
 *          description: Internal Server Error
 */
router.get("/userbike", auth_1.authenticateUser, bikeController_1.getCurrentUserBikes);
/**
 * @swagger
 * /api/bike/{bikeId}:
 *   delete:
 *     summary: Remove a bike from user profile
 *     description: This sets a bike to notInUse
 *     tags:
 *       - Bike
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
 *       400:
 *         description: Bike ID is required
 *       500:
 *         description: Internal server error
 */
router.delete("/:bikeId", auth_1.authenticateUser, bikeValidation_1.validateBikeQuery, bikeController_1.removeBike);
exports.default = router;

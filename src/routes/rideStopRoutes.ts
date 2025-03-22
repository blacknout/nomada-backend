import express from "express";
import {
  createRideStop,
  updateRideStop,
  getRideStop,
  getAllRideStops,
  resolveRideStop,
  deleteRideStop
} from "../controllers/rideStopController";
import { 
  validateRideStopInfo,
  validateStopQuery
} from "../middleware/rideStopValidation";
import { 
  validateRideQuery
} from "../middleware/rideValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();


/**
 * @swagger
 * /stop/rideId:
 *   post:
 *     summary: Create a ride stop
 *     description: Records a stop during a ride due to resting, an accident, or a mechanical fault.
 *     tags:
 *       - Ride Stops
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride for which the stop is being recorded.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - reason
 *               - location
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user reporting the stop.
 *                 example: "b6a1c3d7-2e8a-4b5f-b9c3-1e5d7f2a4c6b"
 *               reason:
 *                 type: string
 *                 enum: ["safe", "accident", "mechanical_fault"]
 *                 description: The reason for the stop.
 *                 example: "mechanical_fault"
 *               location:
 *                 type: object
 *                 description: The GPS location of the stop.
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 40.7128
 *                   longitude:
 *                     type: number
 *                     example: -74.0060
 *     responses:
 *       201:
 *         description: Ride stop recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride stop recorded"
 *                 stop:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "f1a2b3c4-d5e6-7890-1234-56789abcdef0"
 *                     rideId:
 *                       type: string
 *                       example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                     userId:
 *                       type: string
 *                       example: "b6a1c3d7-2e8a-4b5f-b9c3-1e5d7f2a4c6b"
 *                     reason:
 *                       type: string
 *                       example: "accident"
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 40.7128
 *                         longitude:
 *                           type: number
 *                           example: -74.0060
 *                     isResolved:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 *       404:
 *         description: Ride not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride not found."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error."
 */
router.post("/:rideId",
  authenticateUser,
  validateRideQuery,
  validateRideStopInfo,
  createRideStop
);


/**
 * @swagger
 * /stop/stopId:
 *   put:
 *     summary: update a ride stop
 *     description: Updates a stop modifying the location or the reason.
 *     tags:
 *       - Ride Stops
 *     parameters:
 *       - in: path
 *         name: stopId
 *         required: true
 *         description: The ID of the stop to be updated.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *               - location
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: ["safe", "accident", "mechanical_fault"]
 *                 description: The reason for the stop.
 *                 example: "mechanical_fault"
 *               location:
 *                 type: object
 *                 description: The GPS location of the stop.
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 40.7128
 *                   longitude:
 *                     type: number
 *                     example: -74.0060
 *     responses:
 *       200:
 *         description: Ride stop updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride stop updated"
 *                 stop:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rideId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 40.7128
 *                         longitude:
 *                           type: number
 *                           example: -74.0060
 *                     isResolved:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 *       404:
 *         description: Stop not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stop not found."
 *       403:
 *         description: You are not authorized to update this stop.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to update this stop."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error."
 */
router.put("/:stopId",
  authenticateUser, 
  validateStopQuery,
  validateRideStopInfo, 
  updateRideStop
);


/**
 * @swagger
 * /{stopId}:
 *   get:
 *     summary: Get details of a ride stop
 *     description: Fetches the details of a specific ride stop.
 *     tags:
 *       - Ride Stops
 *     parameters:
 *       - in: path
 *         name: stopId
 *         required: true
 *         description: The ID of the ride stop.
 *         schema:
 *           type: string
 *           example: "f1a2b3c4-d5e6-7890-1234-56789abcdef0"
 *     responses:
 *       200:
 *         description: Ride stop details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stop:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rideId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 40.7128
 *                         longitude:
 *                           type: number
 *                           example: -74.0060
 *                     isResolved:
 *                       type: boolean
 *                       example: false
 *       404:
 *         description: Ride stop not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride stop not found."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error."
 */

router.get("/:stopId",
  authenticateUser,
  validateStopQuery,
  getRideStop
);

/**
 * @swagger
 * /ride/{rideId}:
 *   get:
 *     summary: Get all ride stops for a ride
 *     description: Fetches all stops that occurred during a specific ride.
 *     tags:
 *       - Ride Stops
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride for which stops are being retrieved.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     responses:
 *       200:
 *         description: List of ride stops retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stops:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       rideId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       reason:
 *                         type: string
 *                         enum: ["safe", "accident", "mechanical_fault"]
 *                       location:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                             example: 40.7128
 *                           longitude:
 *                             type: number
 *                             example: -74.0060
 *                       isResolved:
 *                         type: boolean
 *                         example: false
 *       404:
 *         description: No stops found for this ride.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No stops found for this ride."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error."
 */

router.get("/ride/:rideId", 
  authenticateUser,
  validateRideQuery,
  getAllRideStops
);

/**
 * @swagger
 * /stop/{stopId}:
 *   patch:
 *     summary: Resolve a ride stop
 *     description: Marks a ride stop as resolved, indicating that the issue has been addressed.
 *     tags:
 *       - Ride Stops
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride associated with the stop.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *       - in: path
 *         name: stopId
 *         required: true
 *         description: The ID of the stop to resolve.
 *         schema:
 *           type: string
 *           example: "f1a2b3c4-d5e6-7890-1234-56789abcdef0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isResolved:
 *                 type: boolean
 *                 description: Set to true to resolve the stop.
 *                 example: true
 *     responses:
 *       200:
 *         description: Ride stop has been resolved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride stop has been resolved"
 *                 stop:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "f1a2b3c4-d5e6-7890-1234-56789abcdef0"
 *                     rideId:
 *                       type: string
 *                       example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                     userId:
 *                       type: string
 *                       example: "b6a1c3d7-2e8a-4b5f-b9c3-1e5d7f2a4c6b"
 *                     reason:
 *                       type: string
 *                       enum: ["safe", "accident", "mechanical_fault"]
 *                       example: "mechanical_fault"
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 40.7128
 *                         longitude:
 *                           type: number
 *                           example: -74.0060
 *                     isResolved:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Ride stop is already resolved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride stop is already resolved."
 *       404:
 *         description: Ride stop not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride stop not found"
 *       403:
 *         description: Not authorized to update this stop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized to update this stop"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error."
 */

router.patch("/:stopId",
  authenticateUser,
  validateStopQuery,
  resolveRideStop
);

/**
 * @swagger
 * /stop/{stopId}:
 *   delete:
 *     summary: Delete a ride stop
 *     description: Removes a ride stop from the system.
 *     tags:
 *       - Ride Stops
 *     parameters:
 *       - in: path
 *         name: stopId
 *         required: true
 *         description: The ID of the stop to delete.
 *         schema:
 *           type: string
 *           example: "f1a2b3c4-d5e6-7890-1234-56789abcdef0"
 *     responses:
 *       200:
 *        description: Ride details retrieved successfully
 *        content:
 *        application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                status:
 *                  type: string
 *                  enum: ["pending", "ongoing", "completed"]
 *       404:
 *         description: Ride stop not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride stop not found."
 *       403:
 *         description: Not authorized to delete this stop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authorized to delete this stop"
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error."
 */

router.delete("/:stopId", 
  authenticateUser,
  validateStopQuery,
  deleteRideStop
);

export default router;

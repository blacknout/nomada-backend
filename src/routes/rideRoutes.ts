import express from "express";
import {
  createRide,
  joinRide,
  addRiders,
  removeRiders,
  updateRide,
  getRideDetails,
  getRideParticipants,
  getGroupRides,
  deleteRide,
  saveRideRoute,
  getRideRoute,
  deleteRideRoute,
  getRideHistory,
  updateRideStatus,
  getUserRidesDistance,
  getGroupRidesDistance
} from "../controllers/rideController";
import {
  createRideInfo,
  updateRideInfo,
  validateRideQuery,
  validateRideRoute,
  validateRideStatus
} from "../middleware/rideValidation";
import { 
  validateGroupQuery,
} from "../middleware/groupValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();

/**
 * @swagger
 * /ride/:
 *   post:
 *     summary: Create a new ride
 *     description: Allows a group to create a ride with essential details. The route can only be added when the ride is completed.
 *     tags:
 *       - Rides
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ride to Ekiti"
 *               groupId:
 *                 type: string
 *                 example: "55f32400-e29b-423f-a716-446f4nfe000"
 *               creatorId:
 *                 type: string
 *                 example: "a3d6c690-98c7-11ec-b909-0242ac120002"
 *               roadCaptainId:
 *                 type: string
 *                 example: "a5f7b340-98c7-11ec-b909-0242ac120002"
 *               startLocation:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 37.7749
 *                   longitude:
 *                     type: number
 *                     example: -122.4194
 *               destination:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     example: 34.0522
 *                   longitude:
 *                     type: number
 *                     example: -118.2437
 *               status:
 *                 type: string
 *                 enum: ["pending", "started", "completed"]
 *                 description: Status of the ride. Default is "pending".
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Ride created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ride created successfully"
 *                 ride:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "2f6c8b20-98c8-11ec-b909-0242ac120002"
 *                     groupId:
 *                       type: string
 *                       example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                     creatorId:
 *                       type: string
 *                       example: "a3d6c690-98c7-11ec-b909-0242ac120002"
 *                     roadCaptainId:
 *                       type: string
 *                       example: "a5f7b340-98c7-11ec-b909-0242ac120002"
 *                     startLocation:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 37.7749
 *                         longitude:
 *                           type: number
 *                           example: -122.4194
 *                     destination:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 34.0522
 *                         longitude:
 *                           type: number
 *                           example: -118.2437
 *                     status:
 *                       type: string
 *                       enum: ["pending", "started", "completed"]
 *                       example: "pending"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/", 
  authenticateUser, 
  createRideInfo, 
  createRide
);

/**
 * @swagger
 * /ride/{id}/join:
 *   post:
 *     summary: Join a new ride
 *     description: Allows the current user to join a ride
 *     tags:
 *       - Rides
 *     parameters:
 *       - in: query
 *         name: id
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Join this ride
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have joined ride"
 *                 newParticipant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "2f6c8b20-98c8-11ec-b909-0242ac120002"
 *                     userId:
 *                       type: string
 *                       example: "55f32400-e29b-423f-a716-446f4nfe000"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       400:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/join", 
  authenticateUser, 
  validateRideQuery, 
  joinRide
);


/**
 * @swagger
 * /ride/{id}/add:
 *   post:
 *     summary: Add users to a ride
 *     description: Add users to a ride
 *     tags:
 *       - Rides
 *     parameters:
 *       - in: query
 *         name: id
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *     responses:
 *       200:
 *         description: 2 new rider(s) added to ride.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You are not authorised to add riders.
 *       404:
 *         description: This ride does not exist.
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/:id/add", 
  authenticateUser, 
  validateRideQuery, 
  addRiders
);


/**
 * @swagger
 * /ride/{id}/remove:
 *   post:
 *     summary: Remove users to a ride
 *     description: Remove users to a ride
 *     tags:
 *       - Rides
 *     parameters:
 *       - in: query
 *         name: id
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *     responses:
 *       200:
 *         description: 2 new rider(s) removed from ride.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You are not authorised to remove riders.
 *       404:
 *         description: This ride does not exist.
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/:id/remove", 
  authenticateUser, 
  validateRideQuery, 
  removeRiders
);

/**
 * @swagger
 * /ride/{rideId}:
 *   put:
 *     summary: Update ride details
 *     description: Allows updating the ride details.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the ride to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roadCaptainId:
 *                 type: string
 *                 description: ID of the road captain leading the ride
 *                 example: "a5f7b340-98c7-11ec-b909-0242ac120002"
 *     responses:
 *       200:
 *         description: Ride updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ride updated successfully"
 *                 ride:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "2f6c8b20-98c8-11ec-b909-0242ac120002"
 *                     groupId:
 *                       type: string
 *                       example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                     roadCaptainId:
 *                       type: string
 *                       example: "a5f7b340-98c7-11ec-b909-0242ac120002"
 *                     route:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                             example: 37.7749
 *                           longitude:
 *                             type: number
 *                             example: -122.4194
 *       400:
 *         description: Ride not found
 *       401:
 *         description: Access Denied. No Token Provided.
 *       403:
 *         description: You are not allowed to update this ride.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", 
  authenticateUser, 
  updateRideInfo, 
  updateRide
);

/**
 * @swagger
 * /ride/{rideId}:
 *   patch:
 *     summary: Update ride status
 *     description: Updates the ride status between these options ["pending", "started", "completed"]
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the ride to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["pending", "started", "completed"]
 *                 description: Status of the ride
 *                 example: "started"
 *               roadCaptainId:
 *                 type: string
 *                 description: ID of the road captain leading the ride
 *                 example: "a5f7b340-98c7-11ec-b909-0242ac120002"
 *               route:
 *                 type: array
 *                 description: List of GPS points representing the ride route (only allowed if status = "completed")
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 37.7749
 *                     longitude:
 *                       type: number
 *                       example: -122.4194
 *     responses:
 *       200:
 *         description: Ride updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ride updated successfully"
 *                 ride:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "2f6c8b20-98c8-11ec-b909-0242ac120002"
 *                     groupId:
 *                       type: string
 *                       example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                     roadCaptainId:
 *                       type: string
 *                       example: "a5f7b340-98c7-11ec-b909-0242ac120002"
 *                     status:
 *                       type: string
 *                       enum: ["pending", "started", "completed"]
 *                       example: "started"
 *                     route:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                             example: 37.7749
 *                           longitude:
 *                             type: number
 *                             example: -122.4194
 *       400:
 *         description: Ride not found
 *       401:
 *         description: Access Denied. No Token Provided.
 *       403:
 *         description: You are not allowed to update this ride.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", 
  authenticateUser, 
  validateRideStatus,
  updateRideStatus
);

/**
 * @swagger
 * /ride/{rideId}:
 *   get:
 *     summary: Get ride details
 *     description: Retrieve details of a specific ride by its ID.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride to retrieve.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     responses:
 *       200:
 *         description: Ride details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                 groupId:
 *                   type: string
 *                   example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                 creatorId:
 *                   type: string
 *                   example: "1a2b3c4d5e6f7g8h9i0j"
 *                 roadCaptainId:
 *                   type: string
 *                   example: "2b3c4d5e6f7g8h9i0j1a"
 *                 status:
 *                   type: string
 *                   enum: ["pending", "started", "completed"]
 *                   example: "started"
 *                 startLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 40.7128
 *                     longitude:
 *                       type: number
 *                       example: -74.0060
 *                 endLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 34.0522
 *                     longitude:
 *                       type: number
 *                       example: -118.2437
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T12:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T14:00:00.000Z"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error.
 */
router.get("/:id", 
  authenticateUser,
  validateRideQuery,
  getRideDetails
);


/**
 * @swagger
 * /ride/{id}/participants:
 *   get:
 *     summary: Get ride participants
 *     description: Return the users that have joined this ride.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the ride to retrieve.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     responses:
 *       200:
 *         description: Ride Participants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                 username:
 *                   type: string
 *                 firstname:
 *                   type: string
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error.
 */
router.get("/:id/participants", 
  authenticateUser,
  validateRideQuery,
  getRideParticipants
);

/**
 * @swagger
 * /ride/group/{groupId}:
 *   get:
 *     summary: Get a groups rides
 *     description: Retrieve details of a specific ride by its ID.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: The ID of the ride to retrieve.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: pagination option
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: pagination option
 *     responses:
 *       200:
 *         description: Rides.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                 groupId:
 *                   type: string
 *                   example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                 creatorId:
 *                   type: string
 *                   example: "1a2b3c4d5e6f7g8h9i0j"
 *                 roadCaptainId:
 *                   type: string
 *                   example: "2b3c4d5e6f7g8h9i0j1a"
 *                 status:
 *                   type: string
 *                   enum: ["pending", "started", "completed"]
 *                   example: "started"
 *                 startLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 40.7128
 *                     longitude:
 *                       type: number
 *                       example: -74.0060
 *                 endLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 34.0522
 *                     longitude:
 *                       type: number
 *                       example: -118.2437
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T12:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T14:00:00.000Z"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error.
 */
router.get("/group/:id", 
  authenticateUser,
  validateGroupQuery,
  getGroupRides
);

/**
 * @swagger
 * /ride/group/{groupId}/data:
 *   get:
 *     summary: Get a groups rides data
 *     description: Retrieve details of a specific ride by its ID.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: The ID of the ride to retrieve.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: pagination option
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: pagination option
 *     responses:
 *       200:
 *         description: Rides.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                 groupId:
 *                   type: string
 *                   example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                 creatorId:
 *                   type: string
 *                   example: "1a2b3c4d5e6f7g8h9i0j"
 *                 roadCaptainId:
 *                   type: string
 *                   example: "2b3c4d5e6f7g8h9i0j1a"
 *                 status:
 *                   type: string
 *                   enum: ["pending", "started", "completed"]
 *                   example: "started"
 *                 startLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 40.7128
 *                     longitude:
 *                       type: number
 *                       example: -74.0060
 *                 endLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 34.0522
 *                     longitude:
 *                       type: number
 *                       example: -118.2437
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T12:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T14:00:00.000Z"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error.
 */
router.get("/group/:id/data", 
  authenticateUser,
  validateGroupQuery,
  getGroupRidesDistance
);

/**
 * @swagger
 * /ride/{rideId}:
 *   delete:
 *     summary: Delete a ride
 *     description: Deletes a ride by its ID. Only the creator or an admin can delete a ride.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride to delete.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     responses:
 *       200:
 *         description: Ride deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride deleted successfully."
 *       401:
 *         description: Access Denied. No Token Provided.
 *       403:
 *         description: Unauthorized to delete this ride
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized to delete this ride"
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
router.delete("/:id", 
  authenticateUser, 
  validateRideQuery,
  deleteRide
);

/**
 * @swagger
 * /ride/route/{rideId}:
 *   post:
 *     summary: Save ride route
 *     description: Saves the route for a ride as an array of GPS coordinates. The route can only be updated once the ride is completed.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride for which the route is being saved.
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
 *               - route
 *             properties:
 *               route:
 *                 type: array
 *                 description: An array of GPS coordinates representing the ride route.
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 37.7749
 *                     longitude:
 *                       type: number
 *                       example: -122.4194
 *                     address:
 *                       type: string
 *                       example: "12b, Jackson Street"
 *     responses:
 *       200:
 *         description: Ride route saved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride route saved."
 *       400:
 *         description: Cannot save ride route until ride is completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cannot save ride route until ride is completed."
 *       401:
 *         description: Access Denied. No Token Provided.
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
router.post("/route/:id", 
  authenticateUser,
  validateRideRoute,
  saveRideRoute
);

/**
 * @swagger
 * /ride/route/{rideId}:
 *   get:
 *     summary: Get ride route
 *     description: Retrieves the saved route for a specific ride, represented as an array of GPS coordinates.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride whose route is being retrieved.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     responses:
 *       200:
 *         description: Successfully retrieved the ride route.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rideId:
 *                   type: string
 *                   example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                 route:
 *                   type: array
 *                   description: An array of GPS coordinates representing the ride route.
 *                   items:
 *                     type: object
 *                     properties:
 *                       latitude:
 *                         type: number
 *                         example: 37.7749
 *                       longitude:
 *                         type: number
 *                         example: -122.4194
 *                       address:
 *                         type: string
 *                         example: "12b, Jackson Street"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found OR No route data available for this ride.
 *         content:
 *           application/json:
 *             oneOf:
 *               - description: Ride not found
 *                 schema:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Ride not found."
 *               - description: No route data available
 *                 schema:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "No route data available for this ride."
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
router.get("/route/:id", 
  authenticateUser,
  validateRideQuery,
  getRideRoute
);

/**
 * @swagger
 * /ride/route/{rideId}:
 *   delete:
 *     summary: Delete ride route
 *     description: Deletes the saved route for a specific ride. Only allowed if the ride has been completed.
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rideId
 *         required: true
 *         description: The ID of the ride whose route is being deleted.
 *         schema:
 *           type: string
 *           example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *     responses:
 *       200:
 *         description: Ride route deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride route deleted successfully"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ride not found"
  *       403:
 *         description: You are not allowed to delete this route
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not allowed to delete this route"
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
router.delete("/route/:id", 
  authenticateUser, 
  validateRideQuery,
  deleteRideRoute
);

/**
 * @swagger
 * /ride/user/history:
 *   get:
 *     summary: Get your ride history
 *     description: Retrieves the ride history of the current user
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: The page of the history
 *         schema:
 *           type: number
 *           example: 1
 *     responses:
 *       200:
 *         description: Ride details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                 groupId:
 *                   type: string
 *                   example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                 creatorId:
 *                   type: string
 *                   example: "1a2b3c4d5e6f7g8h9i0j"
 *                 roadCaptainId:
 *                   type: string
 *                   example: "2b3c4d5e6f7g8h9i0j1a"
 *                 status:
 *                   type: string
 *                   enum: ["pending", "started", "completed"]
 *                   example: "started"
 *                 startLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 40.7128
 *                     longitude:
 *                       type: number
 *                       example: -74.0060
 *                 endLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 34.0522
 *                     longitude:
 *                       type: number
 *                       example: -118.2437
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T12:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T14:00:00.000Z"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error.
 */
router.get("/user/history", 
  authenticateUser, 
  getRideHistory
);

/**
 * @swagger
 * /ride/user/data:
 *   get:
 *     summary: Get your ride history
 *     description: Retrieves the ride history of the current user
 *     tags:
 *       - Rides
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: The page of the history
 *         schema:
 *           type: number
 *           example: 1
 *     responses:
 *       200:
 *         description: Ride details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "d4f6e8a2-9b7c-4f3a-8a2d-1b3e5f7c9d4e"
 *                 groupId:
 *                   type: string
 *                   example: "55f32400-e29b-423f-a716-446f4nfe000"
 *                 creatorId:
 *                   type: string
 *                   example: "1a2b3c4d5e6f7g8h9i0j"
 *                 roadCaptainId:
 *                   type: string
 *                   example: "2b3c4d5e6f7g8h9i0j1a"
 *                 status:
 *                   type: string
 *                   enum: ["pending", "started", "completed"]
 *                   example: "started"
 *                 startLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 40.7128
 *                     longitude:
 *                       type: number
 *                       example: -74.0060
 *                 endLocation:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       example: 34.0522
 *                     longitude:
 *                       type: number
 *                       example: -118.2437
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T12:00:00.000Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-19T14:00:00.000Z"
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Server error.
 */
router.get("/user/data", 
  authenticateUser, 
  getUserRidesDistance
);

export default router;

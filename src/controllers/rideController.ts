import { Request, Response } from "express";
import errorResponse from "../errors/errorResponse";
import { User, GroupMember, Group, Ride } from "../models/associations";
import {
  getUserRideHistory,
  createRideName,
  handleRideStatus,
  getAllGroupRides,
  handleSaveRideRoute,
  getDirections,
  generateMockRoute
} from "../services/rideServices";
import { getRideDistance } from "../utils/calc";

/**
 * @typedef {Object} GeoPoint
 * @property {number} latitude - The latitude of the location.
 * @property {number} longitude - The longitude of the location.
 */

/**
 * @typedef {Object} Ride
 * @property {string} id - The unique ID of the ride.
 * @property {string} groupId - The ID of the group creating the ride.
 * @property {string} roadCaptainId - The ID of the road captain leading the ride. (Optional)
 * @property {GeoPoint} startLocation - The starting location of the ride.  (Optional)
 * @property {GeoPoint} destination - The destination of the ride.  (Optional)
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - The error message.
 */

/**
 * Creates a new ride.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<Ride | ErrorResponse>>} JSON response with ride details or an error message.
 *
 * @example
 * // Request Body:
 * {
 *   "groupId": "12345",
 *   "creatorId": "user123",
 *   "roadCaptainId": "captain567",
 *   "startLocation": { "latitude": 12.345, "longitude": 67.890 },
 *   "destination": { "latitude": 98.765, "longitude": 43.210 },
 * }
 *
 * @response 201 - Ride created successfully
 * {
 *   "message": "Ride created successfully",
 *   "ride": {
 *     "id": "ride123",
 *     "groupId": "12345",
 *     "creatorId": "user123",
 *     "roadCaptainId": "captain567",
 *     "startLocation": { "latitude": 12.345, "longitude": 67.890 },
 *     "destination": { "latitude": 98.765, "longitude": 43.210 },
 *     "route": [],
 *     "status": "pending",
 *     "createdAt": "2025-03-19T12:00:00.000Z",
 *     "updatedAt": "2025-03-19T12:00:00.000Z"
 *   }
 * }
 *
 *
 *  @response 404 - Bad Request Group not foundor not a member
 * {
 *   "error": "Group does not exist or this user is not part of this group."
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const createRide = async (req: Request, res: Response) => {
  try {
    const { name, groupId, roadCaptainId, startLocation, destination } =
      req.body;
    const userId = req.user?.id;

    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: "groupAdmins",
        },
      ],
    });

    if (!group) {
      res.status(404).json({ message: "This group does not exist." });
      return;
    }

    const userIsAdmin = group?.groupAdmins?.some(
      (admin: any) => admin.id === userId
    );

    if (!userIsAdmin) {
      res.status(403).json({ message: "Only Group admins can create a ride." });
      return;
    }

    const groupMembers = await GroupMember.findAll({
      where: { groupId },
      attributes: ["userId"],
    });

    const memberIds = groupMembers.map((gm) => gm.userId);
    const creatorIsMember = memberIds.includes(userId);
    const roadCaptainIsMember = memberIds.includes(roadCaptainId);

    if (!creatorIsMember || !roadCaptainIsMember) {
      res
        .status(404)
        .json({
          message:
            "The Ride Creator or the Road Captain are not members of this group.",
        });
      return;
    }

    let rideDirections =
      startLocation && destination
        ? await getDirections(startLocation, destination)
        : null;

    const newRide = await Ride.create({
      name: name || createRideName(group.name),
      groupId,
      createdBy: userId,
      roadCaptainId,
      startLocation,
      destination,
      rideDirections,
      status: "pending",
    });

    await (newRide as any).addParticipant(userId);

    const responseRide = {
      ...newRide.toJSON(),
      rideDirections: rideDirections ?? (
        startLocation && destination
          ? generateMockRoute(startLocation, destination)
          : null
      ),
    };
    res
      .status(201)
      .json({ 
        message: "Ride created successfully", 
        ride: responseRide,
      });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const joinRide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const ride = await Ride.findByPk(id, {
      include: [{ model: Group, as: "rideGroup" }],
    });
    if (!ride) {
      res.status(404).json({ message: "This ride does not exist." });
      return;
    }
    const group = ride.rideGroup;
    const groupId = group.id;
    const isMember = await GroupMember.findOne({
      where: {
        userId,
        groupId,
      },
    });

    if (isMember) {
      const newParticipant = await (ride as any).addParticipant(userId);
      res
        .status(200)
        .json({ message: `You have joined ${ride.name}`, newParticipant });
      return;
    }
    res
      .status(400)
      .json({
        message: "You cannot join this ride as you are not a group member.",
      });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const addRiders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { userIds } = req.body;

    const ride = await Ride.findByPk(id, {
      include: [{ model: Group, as: "rideGroup" }],
    });
    if (!ride) {
      res.status(404).json({ message: "This ride does not exist." });
      return;
    }

    const group = ride.rideGroup;
    const isAdmin =
      group?.groupAdmins?.some((admin: any) => admin.id === userId) ||
      ride.roadCaptainId === userId;

    if (!isAdmin) {
      res
        .status(403)
        .json({ message: "You are not authorised to add riders." });
      return;
    }

    const users = await User.findAll({
      where: { id: userIds },
    });
    if (users.length > 0) await ride.addParticipants(users);

    res
      .status(200)
      .json({ message: `${users.length} new rider(s) added to ride.` });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const removeRiders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { userIds } = req.body;

    const ride = await Ride.findByPk(id, {
      include: [{ model: Group, as: "rideGroup" }],
    });
    if (!ride) {
      res.status(404).json({ message: "This ride does not exist." });
      return;
    }
    const group = ride.rideGroup;
    const isAdmin =
      group?.groupAdmins?.some((admin: any) => admin.id === userId) ||
      ride.roadCaptainId === userId;

    if (!isAdmin) {
      res
        .status(403)
        .json({ message: "You are not authorised to add riders." });
      return;
    }

    const users = await User.findAll({
      where: { id: userIds },
    });

    if (users.length > 0) await ride.removeParticipants(users);

    res
      .status(200)
      .json({ message: `${users.length} rider(s) removed from the ride.` });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * @typedef {Object} GeoPoint
 * @property {number} latitude - The latitude of the location.
 * @property {number} longitude - The longitude of the location.
 */

/**
 * @typedef {Object} Ride
 * @property {string} id - The unique ID of the ride.
 * @property {string} groupId - The ID of the group creating the ride.
 * @property {string} creatorId - The ID of the user who created the ride.
 * @property {string} roadCaptainId - The ID of the road captain leading the ride.
 * @property {GeoPoint} startLocation - The starting location of the ride.
 * @property {GeoPoint} destination - The destination of the ride.
 * @property {GeoPoint[]} route - An array of GPS points representing the route.
 * @property {enum} status - An enum of "pending", "started" or "completed"
 * @property {Date} createdAt - The timestamp when the ride was created.
 * @property {Date} updatedAt - The timestamp when the ride was last updated.
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - The error message.
 */

/**
 * Updates an existing ride.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<Ride | ErrorResponse>>} JSON response with updated ride details or an error message.
 *
 * @example
 * // Request Body:
 * {
 *   "roadCaptainId": "captain567",
 *   "status": "started",
 *   "route": [
 *     { "latitude": 13.123, "longitude": 68.456 },
 *     { "latitude": 14.789, "longitude": 69.789 }
 *   ]
 * }
 *
 * @response 200 - Ride updated successfully
 * {
 *   "message": "Ride updated successfully",
 *   "ride": {
 *     "id": "ride123",
 *     "groupId": "12345",
 *     "creatorId": "user123",
 *     "roadCaptainId": "captain567",
 *     "startLocation": { "latitude": 12.345, "longitude": 67.890 },
 *     "destination": { "latitude": 98.765, "longitude": 43.210 },
 *     "status": "started",
 *     "createdAt": "2025-03-19T12:00:00.000Z",
 *     "updatedAt": "2025-03-19T12:30:00.000Z"
 *   }
 * }
 *
 * @response 400 - Bad Request (Invalid data)
 * {
 *   "error": "Invalid ride data provided"
 * }
 *
 * @response 404 - Ride not found
 * {
 *   "error": "Ride not found"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const updateRide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, startLocation, destination, roadCaptainId } = req.body;

    const ride = await Ride.findByPk(id);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }
    const isAuthorized = 
      ride.createdBy === req.user.id || 
      ride.roadCaptainId === req.user.id;

    if (!isAuthorized) {
      res
        .status(403)
        .json({ message: "You are not allowed to update this ride." });
      return;
    }

    if (name) ride.name = name;
    if (roadCaptainId) ride.roadCaptainId = roadCaptainId;
    let directions: any = null;

    if (startLocation && destination) {
      ride.startLocation = startLocation;
      ride.destination = destination;

      directions = await getDirections(startLocation, destination);
      if (directions) ride.rideDirections = directions;
    }

    await ride.save();
    const responseRide = {
      ...ride.toJSON(),
      rideDirections: ride.rideDirections ?? (
        startLocation && destination
          ? generateMockRoute(startLocation, destination)
          : null
      ),
    };
    res.status(200).json({ 
      message: "Ride updated successfully", 
      ride: responseRide
    });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const updateRideStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;

    const ride = await Ride.findByPk(id, {
      include: [
        {
          model: Group,
          as: "rideGroup",
          include: [
            {
              model: User,
              as: "groupAdmins",
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!ride) {
      res.status(404).json({ message: "Ride not found." });
      return;
    }
    const response = await handleRideStatus(
      req.user.id,
      ride,
      status,
      location
    );

    res.status(response.status).json({
      response,
    });
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * @typedef {Object} GeoPoint
 * @property {number} latitude - The latitude of the location.
 * @property {number} longitude - The longitude of the location.
 */

/**
 * @typedef {Object} Ride
 * @property {string} id - The unique ID of the ride.
 * @property {string} groupId - The ID of the group that created the ride.
 * @property {string} creatorId - The ID of the user who created the ride.
 * @property {string} roadCaptainId - The ID of the road captain leading the ride.
 * @property {GeoPoint} startLocation - The starting location of the ride.
 * @property {GeoPoint} destination - The destination of the ride.
 * @property {GeoPoint[]} route - An array of GPS points representing the route.
 * @property {enum} status - An enum of "pending", "started" or "completed"
 * @property {Date} createdAt - The timestamp when the ride was created.
 * @property {Date} updatedAt - The timestamp when the ride was last updated.
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - The error message.
 */

/**
 * Retrieves details of a specific ride by ID.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<Ride | ErrorResponse>>} JSON response with ride details or an error message.
 *
 * @example
 * // Request:
 * GET /api/ride/ride123
 *
 * @response 200 - Ride details retrieved successfully
 * {
    "ride": {
        "id": "06bb0062-9bcf-4f87-83b8-eb2cc631423b",
        "name": "Lekki Sunday Ride",
        "groupId": "7dee00f4-5f2f-44a4-9b2a-4bfef2828121",
        "createdBy": "ea36c4c6-2f88-46fe-937f-091ff41cfc6f",
        "roadCaptainId": "7898133b-172a-4628-b52b-f1bad62cf58d",
        "route": [
            {
                "address": null,
                "latitude": 6.5244,
                "longitude": 3.3792
            },
            {
                "latitude": 6.535,
                "longitude": 3.3932
            },
            {
                "latitude": 6.545,
                "longitude": 3.4032
            }
        ],
        "startLocation": {
            "address": null,
            "latitude": 6.5244,
            "longitude": 3.3792
        },
        "destination": {
            "latitude": 6.545,
            "longitude": 3.4032
        },
        "status": "completed",
        "createdAt": "2025-05-10T17:09:08.242Z",
        "updatedAt": "2025-05-10T17:09:08.242Z",
        "group": {
            "id": "7dee00f4-5f2f-44a4-9b2a-4bfef2828121",
            "name": "Lagos Riders",
            "description": "Weekend rides around Lagos",
            "isPrivate": false,
            "isRestricted": false,
            "createdBy": "ea36c4c6-2f88-46fe-937f-091ff41cfc6f",
            "createdAt": "2025-05-10T17:09:08.223Z",
            "updatedAt": "2025-05-10T17:09:08.223Z"
        },
        "creator": {
            "id": "ea36c4c6-2f88-46fe-937f-091ff41cfc6f",
            "username": "John.Doe"
        },
        "roadCaptain": {
            "id": "7898133b-172a-4628-b52b-f1bad62cf58d",
            "username": "Jane Smith"
        }
    },
    "participants": [
        {
            "id": "ea36c4c6-2f88-46fe-937f-091ff41cfc6f",
            "username": "John.Doe",
            "firstname": "John",
            "avatar": null
        },
        {
            "id": "7898133b-172a-4628-b52b-f1bad62cf58d",
            "username": "Jane Smith",
            "firstname": "Jane",
            "avatar": null
        }
    ],
    "distance": 3.5
 *}
 *
 * @response 404 - Ride not found
 * {
 *   "error": "Ride not found"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const getRideDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findByPk(id, {
      include: [
        { model: Group, as: "rideGroup" },
        { model: User, as: "creator", attributes: ["id", "username"] },
        { model: User, as: "roadCaptain", attributes: ["id", "username"] },
      ],
    });

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    const participants = await ride.getParticipants({
      attributes: ["id", "username", "firstname", "avatar"],
      joinTableAttributes: [],
    });
    const { startLocation, destination } = ride;
    const distance =
      startLocation && destination
        ? getRideDistance(
            startLocation.latitude,
            startLocation.longitude,
            destination.latitude,
            destination.longitude
          )
        : null;
    res.status(200).json({ ride, participants, distance });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getRideDirections = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const ride = await Ride.findByPk(id);

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    const { startLocation, destination } = ride;
    if (!startLocation || !destination) {
      res.status(400).json({
        message: "This Ride does not have both start and destination locations.",
      });
      return;
    }

    const rideDirections =
      ride.rideDirections ||
      (await getDirections(startLocation, destination)) ||
      generateMockRoute(startLocation, destination);

    res.status(200).json({ 
      message: "directions retrieved successfully.",
      directions: rideDirections
    });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
}

export const getRideParticipants = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findByPk(id);

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    const participants = await ride.getParticipants({
      attributes: ["id", "username", "firstname", "avatar"],
      joinTableAttributes: [],
    });

    res.status(200).json({ participants });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * @typedef {Object} SuccessResponse
 * @property {string} message - The success message.
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - The error message.
 */

/**
 * Deletes a ride by its ID.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<SuccessResponse | ErrorResponse>>} JSON response with a success message or an error.
 *
 * @example
 * // Request:
 * DELETE /api/ride/ride123
 *
 * @response 200 - Ride deleted successfully
 * {
 *   "message": "Ride deleted successfully"
 * }
 *
 * @response 404 - Ride not found
 * {
 *   "error": "Ride not found"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const deleteRide = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const ride = await Ride.findByPk(id);

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.createdBy !== userId && ride.roadCaptainId !== userId) {
      res.status(403).json({ message: "Unauthorized to delete this ride" });
      return;
    }
    await ride.destroy();

    res.status(200).json({ message: "Ride deleted successfully" });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * @typedef {Object} Location
 * @property {number} latitude - The latitude of the GPS point.
 * @property {number} longitude - The longitude of the GPS point.
 */

/**
 * @typedef {Object} SuccessResponse
 * @property {string} message - The success message.
 * @property {Location[]} route - The saved route array.
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - The error message.
 */

/**
 * Saves a route for a ride.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<SuccessResponse | ErrorResponse>>} JSON response with success message or error.
 *
 * @example
 * // Request:
 * POST /api/ride/route/ride123
 * {
 *   "route": [
 *     { "latitude": 37.7749, "longitude": -122.4194 },
 *     { "latitude": 37.7750, "longitude": -122.4189 }
 *   ]
 * }
 *
 * @response 200 - Ride route saved.
 * {
 *   "message": "Ride route saved.",
 * }
 *
 * @response 400 - Invalid request
 * {
 *   "error": "Route must be a non-empty array of valid GPS points"
 * }
 *
 * @response 400 - Invalid request
 * {
 *   "error": "Cannot save ride route until ride is completed."
 * }
 *
 * @response 404 - Ride not found
 * {
 *   "error": "Ride not found"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const saveRideRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { route } = req.body;

    const ride = await Ride.findByPk(id);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.status !== "completed") {
      res
        .status(400)
        .json({ message: "Cannot save ride route until ride is completed." });
      return;
    }

    if (ride.route) {
      res.status(400).json({ message: "This route has already been saved." });
      return;
    } else if (ride.status == "completed" && route.length) {
      const response = await handleSaveRideRoute(ride, route);
      res.status(response.status).json({
        message: response.message,
        ride: response.ride,
      });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * @typedef {Object} Location
 * @property {number} latitude - The latitude of the GPS point.
 * @property {number} longitude - The longitude of the GPS point.
 */

/**
 * @typedef {Object} SuccessResponse
 * @property {string} message - The success message.
 * @property {Location[]} route - The retrieved route array.
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - The error message.
 */

/**
 * Retrieves the route for a given ride.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<SuccessResponse | ErrorResponse>>} JSON response with route data or error.
 *
 * @example
 * // Request:
 * GET /api/ride/route/ride123
 *
 * @response 200 - Route retrieved successfully
 * {
 *   "route": [
 *     { "latitude": 37.7749, "longitude": -122.4194 },
 *     { "latitude": 37.7750, "longitude": -122.4189 }
 *   ]
 * }
 *
 * @response 404 - Ride not found
 * {
 *   "error": "Ride not found"
 * }
 *
 * @response 404 - No route data available for this ride
 * {
 *   "error": "No route data available for this ride"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const getRideRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findByPk(id, {
      attributes: ["id", "name", "route"],
    });

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }
    res.status(200).json({ route: ride.route });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * @typedef {Object} SuccessResponse
 * @property {string} message - The success message.
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - The error message.
 */

/**
 * Deletes a ride route by its ID.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<SuccessResponse | ErrorResponse>>} JSON response indicating success or failure.
 *
 * @example
 * // Request:
 * DELETE /api/ride/route/ride123
 *
 * @response 200 - Ride route deleted successfully
 * {
 *   "message": "Ride route deleted successfully"
 * }
 *@response 403 - You are not allowed to delete this route
 * {
 *   "message": "You are not allowed to delete this route"
 * }
 *
 * @response 404 - Ride not found
 * {
 *   "error": "Ride not found"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const deleteRideRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const ride = await Ride.findByPk(id);

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.createdBy !== userId) {
      res
        .status(403)
        .json({ message: "You are not allowed to delete this route" });
      return;
    } else if (ride.route || ride.route.length > 0) {
      ride.route = [];
      await ride.save();
      res.status(200).json({ message: "Ride route deleted successfully" });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getRideHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const rides = await getUserRideHistory(userId, page, limit);

    res.status(200).json(rides);
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getGroupRides = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const rides = await getAllGroupRides(id, page, limit);

    res.status(200).json({ rides });
    return;
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getGroupRidesDistance = async (req: Request, res: Response) => {
  try {
    const { id: groupId } = req.params;

    const rides = await Ride.findAll({
      where: { groupId },
    });

    let totalDistance = 0;
    let totalRiders = 0;

    for (const ride of rides) {
      totalRiders += await (ride as any).countParticipants();

      const { startLocation, destination } = ride;

      if (startLocation && destination) {
        const distance = getRideDistance(
          startLocation.latitude,
          startLocation.longitude,
          destination.latitude,
          destination.longitude
        );

        totalDistance += distance;
      }
    }

    const averageRiders = Math.ceil(totalRiders / rides.length);
    const totalDistanceKm = totalDistance / 1000;

    res.status(200).json({
      groupId,
      rideCount: rides.length,
      totalDistanceMeters: totalDistance,
      totalDistanceKm,
      averageRiders,
    });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getUserRidesDistance = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const rides = await Ride.findAll({
      include: [
        {
          model: User,
          as: "participants",
          where: { id },
          attributes: [],
        },
      ],
    });

    let totalDistance = 0;

    for (const ride of rides) {
      const { startLocation, destination } = ride;

      if (startLocation && destination) {
        const distance = getRideDistance(
          startLocation.latitude,
          startLocation.longitude,
          destination.latitude,
          destination.longitude
        );

        totalDistance += distance;
      }
    }

    const totalDistanceKm = totalDistance / 1000;

    res.status(200).json({
      rideCount: rides.length,
      totalDistanceMeters: totalDistance,
      totalDistanceKm,
    });
  } catch (error) {
    errorResponse(res, error);
  }
};

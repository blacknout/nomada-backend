import { Request, Response } from "express";
import errorResponse from "../errors/errorResponse";
import { User, GroupMember, Group, Ride } from "../models/associations";
import { 
  getUserRideHistory,
  createRideName,
  handleRideStatus,
  getAllGroupRides
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
    const { name, groupId, roadCaptainId, startLocation, destination } = req.body;
    const userId = req.user?.id;

    const isMember = await GroupMember.findOne({
      where: { userId, groupId },
      include: [{
        model: Group,
        as: "group",
        attributes: ["id", "name"]
      }]
    }) as GroupMember & { group: Group}

    if (!isMember) {
      res
        .status(404)
        .json({ message: "Group does not exist or this user is not part of this group." });
      return;
    }

    const newRide = await Ride.create({
      name: name || createRideName(isMember.group.name),
      groupId,
      createdBy: userId,
      roadCaptainId,
      startLocation,
      destination,
      status: "pending",
    });

    res.status(201)
      .json({ message: "Ride created successfully", 
      ride: newRide
    });
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
    const { rideId } = req.params;
    const { name, startLocation, destination, roadCaptainId } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.createdBy === req.user.id || ride.roadCaptainId === req.user.id) {
      if (name) ride.name = name;
      if (startLocation) ride.startLocation = startLocation;
      if (destination) ride.destination = destination;
      if (roadCaptainId) ride.roadCaptainId = roadCaptainId;
  
      await ride.save();
  
      res.status(200).json({ message: "Ride updated successfully", ride });
      return;
    } else {
      res.status(403).json({ message: "You are not allowed to update this ride." });
      return;
    }

  } catch (err) {
    errorResponse(res, err);
  }
};

export const updateRideStatus = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { status, location } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) {
      res.status(404).json({ message: "Ride not found." });
      return;
    }
    const response = await handleRideStatus(req.user.id, ride, status, location);

    res.status(response.status).json({
      response
    })
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
    const { rideId } = req.params;

    const ride = await Ride.findByPk(rideId, {
      include: [
        { model: Group, as: "group" },
        { model: User, as: "creator", attributes: ["id", "username"] },
        { model: User, as: "roadCaptain", attributes: ["id", "username"] },
      ],
    });

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    const participants = await ride.getParticipants({
      attributes: ['id', 'username', 'firstname', 'avatar'],
      joinTableAttributes: []
    });
    const { startLocation, destination } = ride;
    const distance = (startLocation && destination)
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
    const { rideId } = req.params;
    const userId = req.user?.id;

    const ride = await Ride.findByPk(rideId);

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
    const { rideId } = req.params;
    const { route } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.status !== "completed") {
      res.status(400).json({ message: "Cannot save ride route until ride is completed." });
      return;
    }

    if (ride.route) {
      res.status(400).json({ message: "This route has already been saved." });
      return
    } else if (ride.status == "completed" && route.length) {
      await ride.update({ route });
      res.status(200).json({ message: "Ride route saved."});
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
    const { rideId } = req.params;

    const ride = await Ride.findByPk(rideId, {
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
    const { rideId } = req.params;
    const userId = req.user?.id; 
    const ride = await Ride.findByPk(rideId);

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.createdBy !== userId) {
      res.status(403).json({ message: "You are not allowed to delete this route" });
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
}

export const getGroupRides = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const rides = await getAllGroupRides(groupId, page, limit);

    res.status(200).json({ rides });
    return;
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getGroupRidesDistance = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

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
      averageRiders
    });

  } catch (error) {
    errorResponse(res, error);
  }
}

export const getUserRidesDistance = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;

    const rides = await Ride.findAll({
      include: [{
        model: User,
        as: "participants",
        where: { id },
        attributes: []
      }],
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
}

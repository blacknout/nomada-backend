import { Request, Response } from "express";
import errorResponse from "../errors/errorResponse";
import { Ride } from "../models/Ride";
import { Group } from "../models/Group";
import { GroupMember } from "../models/GroupMembers";
import { User } from "../models/User";
import { 
  getUserRideHistory,
  createRideName,
  getAllGroupRides
 } from "../services/riderServices";

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
    const { groupId, roadCaptainId, startLocation, destination } = req.body;
    let { name } = req.body;
    const userId = req.user?.id;

    const isMember = await GroupMember.count({
      where: { userId, groupId },
    });
    if (isMember < 1) {
      res
        .status(404)
        .json({ message: "Group does not exist or this user is not part of this group." });
      return;
    }

    if (!name) {
      const group = await Group.findByPk(groupId);
      name = createRideName(group.name);
    }
    const createdBy = userId;
    const newRide = await Ride.create({
      name,
      groupId,
      createdBy,
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
    const { status } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.createdBy === req.user.id || ride.roadCaptainId === req.user.id) {
      if (status === "started") {
        const ongoingRide = await Ride.findOne({
          where: {
            groupId: ride.groupId,
            status: "ongoing"
          }
        });
        if(ongoingRide) {
          res.status(400)
          .json({ 
            message: "You cannot start a new ride when another ride in this group is ongoing"
          });
          return;
        }
        const group = await Group.findOne({
          where: { id: ride.groupId },
          include: {
            model: User,
            as: "users", 
            attributes: ["id"],
          },
        });
        group.users.map(async(user) => {
          await (ride as any).addParticipant(user);
        });
      }
      ride.status = status;
      await ride.save();
      res.status(200).json({ 
        message: "Ride status updated successfully", 
        ride,
       });
      return;
    } else {
      res.status(403)
      .json({ 
        message: "You are not allowed to update the status of this ride."
      });
      return;
    }
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
 *   "id": "ride123",
 *   "groupId": "group567",
 *   "creatorId": "user123",
 *   "roadCaptainId": "captain789",
 *   "startLocation": { "latitude": 12.345, "longitude": 67.890 },
 *   "destination": { "latitude": 98.765, "longitude": 43.210 },
 *   "started": "started",
 *   "createdAt": "2025-03-19T12:00:00.000Z",
 *   "updatedAt": "2025-03-19T12:30:00.000Z"
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
    res.status(200).json({ ride });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

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

    const ride = await Ride.findByPk(rideId, {
      include: [{ model: Group, as: "group" }],
    });

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
    const { route, name } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.route) {
      res.status(400).json({ message: "This route has already been saved." });
      return
    } else if (!ride.name && name) {
      res.status(400).json({ message: "This route must have a name." });
      return
    } else if (ride.status == "completed" && route.length) {
      await ride.update({ route, name });
      res.status(200).json({ message: "Ride route saved."});
      return;
    } else if (ride.status !== "completed") {
      res.status(400).json({ message: "Cannot save ride route until ride is completed." });
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
      attributes: ["id", "route"],
    });

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    } else if (!ride.route || ride.route.length === 0) {
      res.status(404).json({ message: "No route data available for this ride" });
      return;
    } else {
      res.status(200).json({ route: ride.route });
      return;
    }
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


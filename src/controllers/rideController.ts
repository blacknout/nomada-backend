import { Request, Response } from "express";
import { Ride } from "../models/Ride";
import { Group } from "../models/Group";
import { User } from "../models/User";


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
 * @response 400 - Bad Request (Missing required fields)
 * {
 *   "error": "Missing required fields"
 * }
 *
 *  @response 404 - Bad Request Group not found
 * {
 *   "error": "Missing required fields"
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
    const createdBy = req.user?.id;

    if (!createdBy) {
      res.status(401).json({ message: "Unauthorized" });
    } 

    const group = await Group.findByPk(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
    }

    const newRide = await Ride.create({
      groupId,
      createdBy,
      roadCaptainId,
      startLocation,
      destination,
      status: "pending",
    });

    res.status(201).json({ message: "Ride created successfully", ride: newRide });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
 * @property {enum} status - An enum of "pending", "ongoing" or "completed"
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
 *   "status": "ongoing",
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
 *     "status": "ongoing",
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
    const { startLocation, destination, status, roadCaptainId } = req.body;

    const ride = await Ride.findByPk(rideId);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
    }

    if (ride.createdBy === req.user.id || ride.roadCaptainId === req.user.id) {
      if (startLocation) ride.startLocation = startLocation;
      if (destination) ride.destination = destination;
      if (roadCaptainId) ride.roadCaptainId = roadCaptainId;
      if (status) ride.status = status;
  
      await ride.save();
  
      res.status(200).json({ message: "Ride updated successfully", ride });
    } else {
      res.status(403).json({ message: "You are not allowed to update this ride." });
    }

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
 * @property {enum} status - An enum of "pending", "ongoing" or "completed"
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
 *   "started": "ongoing",
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
    }

      res.status(200).json({ ride });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
    }

    if (ride.createdBy !== userId && ride.roadCaptainId !== userId) {
      res.status(403).json({ message: "Unauthorized to delete this ride" });
    }
    await ride.destroy();

    res.status(200).json({ message: "Ride deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
    }

    if (ride.status == "completed" && 
      ride.route.length < 1 && 
      route.length) {
      await ride.update({ route });
      res.status(200).json({ message: "Ride route saved."});
    } else {
      res.status(400).json({ message: "Cannot save ride route until ride is completed." });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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
    } else if (!ride.route || ride.route.length === 0) {
      res.status(404).json({ message: "No route data available for this ride" });
    } else {
      res.status(200).json({ route: ride.route });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
    }

    if (ride.createdBy !== userId) {
      res.status(403).json({ message: "You are not allowed to delete this route" });
    } else if (ride.route || ride.route.length > 0) {
      ride.route = [];
      await ride.save();
      res.status(200).json({ message: "Ride route deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

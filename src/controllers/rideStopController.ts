import { Request, Response } from "express";
import errorResponse from "../errors/errorResponse";
import { RideStop } from "../models/RideStop";

/**
 * @typedef {Object} Coordinates
 * @property {number} latitude - The latitude of the stop location.
 * @property {number} longitude - The longitude of the stop location.
 */

/**
 * @typedef {Object} RideStop
 * @property {string} id - The unique identifier for the ride stop.
 * @property {string} rideId - The ID of the associated ride.
 * @property {string} userId - The ID of the user who reported the stop.
 * @property {"safe" | "accident" | "mechanical"} reason - The reason for the stop.
 * @property {Coordinates} location - The GPS coordinates of the stop location.
 * @property {boolean} isResolved - Whether the stop has been resolved.
 *
 * @example
 * 
 * // Request:
 * POST /api/stop/ride123
 * 
 * const rideStop = {
 *   id: "stop123",
 *   rideId: "ride456",
 *   userId: "user789",
 *   reason: "mechanical",
 *   location: { latitude: 40.7128, longitude: -74.0060 },
 *   isResolved: false
 * };
 */
export const createRideStop = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;
    const { reason, location } = req.body;
    const userId = req.user?.id;

    const rideStop = await RideStop.create({
      rideId,
      userId,
      reason,
      location,
    });

    res.status(201).json({ message: "Ride stop recorded", rideStop });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};

export const updateRideStop = async (req: Request, res: Response) => {
  try {
    const { stopId } = req.params;
    const { reason, location } = req.body;
    const userId = req.user?.id;

    const stop = await RideStop.findByPk(stopId);
    if (!stop) {
      res.status(404).json({ message: "Stop not found." });
      return;
    } else if (userId !== stop.userId) {
      res.status(403).json({ message: "You are not authorized to update this stop." });
      return;
    } else {
      if (reason) stop.reason = reason;
      if (location) stop.location = location;

      await stop.save();
  
      res.status(200).json({ message: "Ride stop has been updated", stop });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};


/**
 * Get all stops for a specific ride.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} A JSON response containing the ride stops.
 *
 * @route GET /stop/ride/:rideId
 * @access Private (Requires authentication)
 *
 * @example
 * // Request: GET /stop/ride/ride123
 * // Response:
 * {
 *   "stops": [
 *     {
 *       "id": "stop123",
 *       "rideId": "ride123",
 *       "userId": "user789",
 *       "reason": "mechanical",
 *       "location": { "latitude": 40.7128, "longitude": -74.0060 },
 *       "isResolved": false
 *     }
 *   ]
 * }
 */
export const getAllRideStops = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;

    const stops = await RideStop.findAll({
      where: { rideId, isResolved: false },
      include: [{ association: "user", attributes: ["id", "username"] }],
    });

    if (stops.length < 1) {
      res.status(404).json({ message: "No stops found for this ride." });
      return;
    } else {
      res.status(200).json({ stops });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * Get stop details by stop Id
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} A JSON response containing the ride stops.
 *
 * @route GET /stop/:stopId
 * @access Private (Requires authentication)
 *
 * @example
 * // Request: GET /stop/stop232
 * // Response:
*     {
*       "id": "stop123",
*       "rideId": "ride123",
*       "userId": "user789",
*       "reason": "mechanical",
*       "location": { "latitude": 40.7128, "longitude": -74.0060 },
*       "isResolved": false

 *    }
 */
export const getRideStop = async (req: Request, res: Response) => {
  try {
    const { stopId } = req.params;

    const stop = await RideStop.findByPk(stopId, {
      include: [{ association: "user", attributes: ["id", "username"] }],
    });

    if (!stop) {
      res.status(404).json({ message: "Ride stop not found." });
      return;
    } else {
      res.status(200).json({ stop });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};


/**
 * Set a ride stop to resolved.
 *
 * @param {Request} req - The Express request object is the stopID in the params
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<Ride | ErrorResponse>>} JSON response with updated ride details or an error message.
 *
 * @example
 * // Request Body:
 * * // Request: PUT /stop/stop232
 * @response 200 - Ride stop has been resolved
 * {
 *   "message": "Ride stop has been resolved",
 *   "rideStop": {
*       "id": "stop123",
*       "rideId": "ride123",
*       "userId": "user789",
*       "reason": "mechanical",
*       "location": { "latitude": 40.7128, "longitude": -74.0060 },
*       "isResolved": true
 *   }
 * }
 *
 * @response 400 - Bad Request (Invalid data)
 * {
 *   "error": "Invalid ride data provided"
 * }
 *
 * @response 404 - Ride stop not found
 * {
 *   "error": "Ride not found"
 * }
 *
 *  @response 403 - Not authorized to update this stop
 * {
 *   "error": "Not authorized to update this stop"
 * }
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const resolveRideStop = async (req: Request, res: Response) => {
  try {
    const { stopId } = req.params;
    const userId = req.user?.id; 

    const rideStop = await RideStop.findByPk(stopId);

    if (!rideStop) {
      res.status(404).json({ message: "Ride stop not found" });
      return;
    } else if (rideStop.userId !== userId) {
      res.status(403).json({ message: "Not authorized to update this stop" });
      return;
    } else if (rideStop.isResolved) {
      res.status(400).json({ message: "Ride stop is already resolved." });
      return;
    } else {
      rideStop.isResolved = true;
      await rideStop.save();
      res.status(200).json({ message: "Ride stop has been resolved", rideStop });
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
 * Deletes a ride stop by its ID.
 *
 * @param {Request} req - The Express request object with stop id in params.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response<SuccessResponse | ErrorResponse>>} JSON response indicating success or failure.
 *
 * @example
 * // Request:
 * DELETE /api/stop/route/stop123
 *
 * @response 200 - Ride stop deleted successfully
 * {
 *   "message": "Ride stop deleted successfully"
 * }
 *@response 403 - Not authorized to delete this stop
 * {
 *   "message": "Not authorized to delete this stop"
 * }
 * 
 * @response 404 - Ride stop not found
 * {
 *   "error": "Ride stop not found"
 * }
 *
 * @response 500 - Internal Server Error
 * {
 *   "error": "Internal Server Error"
 * }
 */
export const deleteRideStop = async (req: Request, res: Response) => {
  try {
    const { stopId } = req.params;
    const userId = req.user?.id;

    const rideStop = await RideStop.findByPk(stopId);

    if (!rideStop) {
      res.status(404).json({ message: "Ride stop not found" });
      return;
    } else if (rideStop.userId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this stop" });
      return;
    } else {
      await rideStop.destroy();
      res.status(200).json({ message: "Ride stop deleted successfully." });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

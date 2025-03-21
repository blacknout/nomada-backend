import { Request, Response, NextFunction, RequestHandler } from "express";
import Bike from "../models/Bike";
import User from "../models/User";


/**
 * Create a new bike.
 *
 * @param {Request} req - Express request object containing bike data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with bike details or error
 */
export const createBike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { plateNumber, make, model, year } = req.body;
    const userId = req.user?.id as string;
    const notInUse = false;

    const newBike = await Bike.create({
        plateNumber,
        make,
        model,
        year,
        userId,
        notInUse
    });

    res.status(201).json({
      message: "Bike created successfully.",
      bike: newBike,
    });
  } catch (err) {
    next(err);
  }
};


/**
 * get a bike.
 *
 * @param {Request} req - Express request object containing bike id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with bike details or error
 */
export const getBike = async (req: Request, res: Response) => {
  try {
      const { bikeId } = req.params;

      const bike = await Bike.findByPk(bikeId, {
          include: [{ model: User, attributes: ["id", "username"] }],
      });

      if (!bike) {
        res.status(404).json({ message: "Bike not found" });
      }

      res.status(200).json({ bike });
  } catch (error) {
      console.error("Error fetching bike:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


/**
 * Update bike details.
 *
 * @param {Request} req - Express request object containing bike data in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns updated bike.
 */
export const updateBike = async (req: Request, res: Response) => {
  try {
      const { bikeId } = req.params;
      const { plateNumber, make, model, year } = req.body;

      const bike = await Bike.findByPk(bikeId);
      if (!bike) {
        res.status(404).json({ message: "Bike not found" });
      } else if (req.user && req.user.id === bike.userId) {
        await bike.update({
          plateNumber: plateNumber || bike.plateNumber,
          make: make || bike.make,
          model: model || bike.model,
          year: year || bike.year,
      });

      res.status(200).json({ message: "Bike updated successfully", bike });
      }

  } catch (error) {
      console.error("Error updating bike:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get a users bike.
 *
 * @param {Request} req - Express request object containing user id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with bike details.
 */
export const getUserBikes = async (req: Request, res: Response) => {
  try {
      const { userId } = req.params;

      const bikes = await Bike.findAll({ where: { userId, notInUse: false } });

      if (!bikes.length) {
        res.status(404).json({ message: "No bikes found for this user" });
      }

      res.status(200).json({ bikes });
  } catch (error) {
      console.error("Error fetching user's bikes:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get the currently authenticated users bike.
 *
 * @param {Request} req - null
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with bike details.
 */
export const getCurrentUserBikes = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(403).json({ message: "Unauthorized" });
    } else {
      const userId = req.user?.id;

      const bikes = await Bike.findAll({ where: { userId, notInUse: false } });

      if (!bikes.length) {
        res.status(404).json({ message: "No bikes found for this user" });
      }

      res.status(200).json({ bikes });
    }
  } catch (error) {
      console.error("Error fetching current user's bikes:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


/**
 * Set bike to not in user
 *
 * @param {Request} req - Express request object containing bike id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with success message.
 */
export const removeBike = async (req: Request, res: Response) => {
  try {
    const { bikeId } = req.params;

    const bike = await Bike.findByPk(bikeId);

    if (!bike) {
      res.status(404).json({ message: "Bike not found" });
    } else if (req.user && req.user.id === bike.userId) {
        await bike.update({
          notInUse: true
      });
      res.status(200).json({ message: "Bike has been removed." });
    }
  } catch (error) {
      console.error("Error updating bike:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

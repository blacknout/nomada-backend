import { Request, Response, NextFunction } from "express";
import errorResponse from "../errors/errorResponse";
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
    const { plate, make, model, year, image, vin } = req.body;
    const userId = req.user?.id as string;
    const notInUse = false;

    const newBike = await Bike.create({
        plate,
        make,
        model,
        year,
        userId,
        notInUse,
        image,
        vin
    });

    res.status(201).json({
      message: "Bike created successfully.",
      bike: newBike,
    });
    return;
  } catch (err) {
    errorResponse(res, err);
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
      include: [{ model: User, attributes: ["id", "username"], as: "owner" }],
    });

    if (!bike) {
      res.status(404).json({ message: "Bike not found" });
    }
    res.status(200).json({ bike });
  } catch (err) {
    errorResponse(res, err);
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
      const { plate, make, model, year, vin, image } = req.body;

      const bike = await Bike.findByPk(bikeId);
      if (!bike) {
        res.status(404).json({ message: "Bike not found" });
      } else if (req.user && req.user.id === bike.userId) {
        await bike.update({
          plate: plate || bike.plate,
          make: make || bike.make,
          model: model || bike.model,
          year: year || bike.year,
          vin: vin || bike.vin,
          image: image || bike.image
      });

      res.status(200).json({ message: "Bike updated successfully", bike });
      }
  } catch (err) {
    errorResponse(res, err);
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
      return; 
    }

    res.status(200).json({ bikes });
    return;
  } catch (err) {
    errorResponse(res, err);
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
        return;
      }

      res.status(200).json({ bikes });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
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
      return;
    } else if (req.user && req.user.id === bike.userId) {
        await bike.update({
          notInUse: true
      });
      res.status(200).json({ message: "Bike has been removed." });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

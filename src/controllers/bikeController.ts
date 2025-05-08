import { Request, Response, NextFunction } from "express";
import errorResponse from "../errors/errorResponse";
import Bike from "../models/Bike";
import User from "../models/User";
import { searchBikeVin } from "../services/searchService";
import { sendSearchedVinNotification } from "../services/notificationService";

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
    const { plate, make, model, year, images, vin } = req.body;
    const userId = req.user?.id as string;
    const notInUse = false;

    const newBike = await Bike.create({
        plate,
        make,
        model,
        year,
        userId,
        notInUse,
        images,
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
    const { plate, make, model, year, vin, stolen, images } = req.body;

    const bike = await Bike.findByPk(bikeId);
    if (!bike) {
      res.status(404).json({ message: "Bike not found" });
    } else if (req.user && req.user.id === bike.userId) {
      const noDuplicateImage = new Set([...(bike.images || []), ...(images || [])]);
      const uniqueImagesArray = Array.from(noDuplicateImage);

    await bike.update({
      plate: plate || bike.plate,
      make: make || bike.make,
      model: model || bike.model,
      year: year || bike.year,
      vin: vin || bike.vin,
      stolen: stolen || bike.stolen,
      images: uniqueImagesArray
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

/**
 * Search bike by VIN
 *
 * @param {Request} req - Express request object containing VIN in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with success message.
 */
export const searchByVin = async (req: Request, res: Response) => {
  try {
    const { vin, location } = req.body;
    const { id } = req.user;
 
    const searcher = await User.findByPk(id);
    if (searcher && vin && location) {
      const bike = await searchBikeVin(vin as string);
      const bikeOwner = await bike.getUser();
      (bike.stolen && id !== bikeOwner.id) && 
        await sendSearchedVinNotification
        (
          bikeOwner,
          searcher, 
          bike, 
          location
        ); 
      res.status(200).json({ bike });
      return;
    } else {
      res.status(400).json({ message: "Bad request." });
    }
  } catch (err) {
    errorResponse(res, err);
  }
}

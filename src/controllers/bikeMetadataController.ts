import { Request, Response } from "express";
import errorResponse from "../errors/errorResponse";
import { bikeData } from "../data/bikeData";

/**
 * Get all bike metadata (makes, types, and years)
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getBikeMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json(bikeData);
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * Get all available bike makes/brands
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getBikeMakes = async (req: Request, res: Response): Promise<void> => {
  try {
    const makes = bikeData.map((bike: any) => bike.make);
    res.status(200).json({ makes });
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * Get all available bike types
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getBikeTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Combine all types from all brands and remove duplicates
    const allTypes = bikeData.flatMap((bike: any) => bike.types);
    const uniqueTypes = [...new Set(allTypes)];
    res.status(200).json({ types: uniqueTypes });
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * Get all available bike years
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getBikeYears = async (req: Request, res: Response): Promise<void> => {
  try {
    // Combine all years from all brands and remove duplicates
    const allYears = bikeData.flatMap((bike: any) => bike.years);
    const uniqueYears = [...new Set(allYears)].sort((a: any, b: any) => parseInt(b) - parseInt(a)); // Sort by most recent first
    res.status(200).json({ years: uniqueYears });
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * Get models for a specific bike make
 * 
 * @param {Request} req - Express request object with make parameter
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getBikeModelsByMake = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make } = req.params;
    const bikeInfo = bikeData.find((bike: any) => bike.make.toLowerCase() === make.toLowerCase());
    
    if (!bikeInfo) {
      res.status(404).json({ message: "Make not found" });
      return;
    }
    
    res.status(200).json({ models: bikeInfo.models });
  } catch (err) {
    errorResponse(res, err);
  }
};

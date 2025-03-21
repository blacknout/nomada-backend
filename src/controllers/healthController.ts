import { Request, Response, NextFunction } from "express";

export const health = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ message: "Health Status Confirmed." });
  } catch (err) {
    next(err);
  }
};

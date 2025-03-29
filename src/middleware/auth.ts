import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";
import { UserPayload } from "../../@types/userPayload";

dotenv.config();

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access Denied. No Token Provided." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    if (!decoded.id) {
      res.status(400).json({ message: "Invalid Token Structure" });
      return;
    }

    const { password, ...excludingPassword } = decoded;
    req.user = excludingPassword;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      res.status(401).json({ message: "Token Expired" });
      return;
    }
    res.status(400).json({ message: "Invalid Token" });
  }
};

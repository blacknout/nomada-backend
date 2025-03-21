import { Request, Response, NextFunction } from "express";

const authorize = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" }); 
    }

    if (req.user.isAdmin !== true) {
      return res.status(403).json({ message: "Forbidden" }); 
    }

    next();
  };
};

export default authorize;

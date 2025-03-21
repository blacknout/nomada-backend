import { Request, Response, NextFunction, RequestHandler } from "express";
import { Op } from "sequelize";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


/**
 * Registers a new user.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with user details or error
 */

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    next(err);
  }
};

/**
 * User Login.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with user token
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id, user: user.username}, process.env.JWT_SECRET as string, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};


/**
 * Get the currently authenticated user.
 *
 * @param {Request} req - Express request object, should contain `user` in `req.user` from auth middleware.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with user details.
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.json({ user: req.user });
};

/**
 * Get the currently authenticated user.
 *
 * @param {Request} req - Express request object containing user id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with user details.
 */
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Get the currently authenticated user.
 *
 * @param {Request} req - null
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns Array with users that match query.
 */
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    if (!search || typeof search !== "string") {
      res.status(400).json({ message: "a query parameter is required" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${search}%` } },
          { firstname: { [Op.iLike]: `%${search}%` } },
          { lastname: { [Op.iLike]: `%${search}%` } },
        ],
      },
      attributes: ["id", "username", "firstname", "lastname"], 
    });

    if (users.length === 0) {
      res.status(404).json({ message: "No users found" });
    } else {
      res.status(200).json({ users });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Update users details.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns updated user.
 */
export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, firstname, lastname, state, country } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
     res.status(404).json({ message: "User not found" });
    } else if (id !== req.user.id && !user.isAdmin) {
      res.status(401).json({ message: "Unauthorized action" });
    } else {
      await user.update({ username, email, firstname, lastname, state, country });
     res.status(200).json({ message: "User updated successfully", user });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Update users password.
 *
 * @param {Request} req - Express request object containing user password in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns success message.
 */
export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
    } 

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await user.update({ password: hashedPassword });
  
      res.status(200).json({ message: "Password updated successfully" });
    }
  } catch (error) {
    next(error);
  }
};
/**
 * Disable account.
 *
 * @param {Request} req - Express request object containing userId in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns success message.
 */

export const disableUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }  else if (user.isAdmin) {
      const { userId } = req.params;
      const user = await User.findByPk(userId);
      await user.update({ isDisabled: true });
      res.status(200).json({ message: "This account has been disabled." });
    } else {
      await user.update({ isDisabled: true });
      res.status(200).json({ message: "This account has been disabled." });
    }
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction, RequestHandler } from "express";
import { Op } from "sequelize";
import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/sendEmail";
import { filterUser } from "../utils/filterUser";


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
    const { email } = req.body;

    let user = await User.findOne({ where: { email } });
    if (user && user.isVerified) {
      res.status(400).json({ message: "Email already exists" });
      return;
    } else if (user && !user.isVerified) {
      res.status(200).json({ message: (await sendOtpEmail(user)).message });
    } else {
      user = await User.create(req.body);
      res.status(201).json({ message: (await sendOtpEmail(user)).message });
    }
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

    if (!user.isVerified) {
      res.status(400).json({ message: "This user is has not verified the account." });
    } else if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      res.status(400).json({ message: "Invalid credentials" });
    } else {
      const token = jwt.sign({ id: user.id, user: user.username}, process.env.JWT_SECRET as string, { expiresIn: "1h" });
      await user.update({ token: token })
      res.status(200).json({ message: "This user has been logged in", token, user });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Verify OTP.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Null
 * @returns {Promise<Response>} - Returns JSON response
 */
export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
    } else if (new Date() > user.otpExpires) {
      res.status(400).json({ message: "OTP expired" });
    } else {
      const token = jwt.sign({ id: user.id, user: user.username}, process.env.JWT_SECRET as string, { expiresIn: "1h" });

      await user.update({ isVerified: true, otp: null, otpExpires: null, token: token });
      res.status(200).json({ message: "Email verified.", token, user });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
    } else {
      const filteredUser = filterUser(user);
      res.status(200).json({ user: filteredUser });
    }
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
    const { username, email, firstname, lastname, state, country, phone } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
     res.status(404).json({ message: "User not found" });
    } else if (id !== req.user.id && !user.isAdmin) {
      res.status(401).json({ message: "Unauthorized action" });
    } else {
      await user.update({ username, email, firstname, lastname, state, country, phone });
      const filteredUser = filterUser(user);
     res.status(200).json({ message: "User updated successfully", user: filteredUser });
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
 * Reset password.
 *
 * @param {Request} req - Express request object containing user email in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns success message.
 */
export const resetPassword : RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ where: { email } });
    
    if (!user || !user.isVerified) {
      res.status(404).json({ message: "User does not exist or has not verified their email." });
      return;
    }
  
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "15m" });
  
    const sent = sendPasswordResetEmail(user, token);
    res.status(200).json({ message: (await sent).message });
  } catch (error) {
    res.status(500).json({ message: "Error sending email", error });
  }
}


/**
 * Password Reset with OTP
 *
 * @param {Request} req - Express request object containing OTP in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns message to reset password with the user object.
 */

export const passwordResetOTP : RequestHandler = async (req, res, next) => {
  try {
    const { otp } = req.body;
    let user = await User.findOne({ where: { otp } });
    
    if (!user) {
      res.status(404).json({ message: "Invalid OTP" });
      return;
    }
    res.status(200).json({ message: "Please reset your password", user });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error sending email", error });
  }
}


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

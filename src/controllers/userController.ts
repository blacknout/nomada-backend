import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../models/User";
import Group from "../models/Group";
import GroupInvitation from "../models/GroupInvitation";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import errorResponse from "../errors/errorResponse";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/emailService";
import { filterUser } from "../utils/filterUser";
import { mergeUsersAndBikeOwners, searchUser, searchBike } from "../services/searchService";
import { FIFTEEN_MINUTE_TOKEN } from "../utils/constants";
import { generateTokenAndUpdate } from "../services/userService";

/**
 * Registers a new user.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with user details or error
 */

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ where: { email } });
    if (user && user.isVerified) {
      res.status(400).json({ message: "Email already exists" });
      return;
    } else if (user && !user.isVerified) {
      res.status(200).json({ message: (await sendOtpEmail(user)).message });
      return;
    } else {
      user = await User.create(req.body);
      res.status(201).json({ message: (await sendOtpEmail(user)).message });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
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
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    } else if (!user.isVerified) {
      res
        .status(400)
        .json({ message: "This user has not verified the account." });
        return;
    } else {
      const token = generateTokenAndUpdate(user);
      res
        .status(200)
        .json({ message: "This user has been logged in", token, user: filterUser(user.toJSON()) });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
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
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email }});

    if (!user || user.otp != otp) {
      res.status(400).json({ message: "Invalid OTP" });
    } else if (new Date() > user.otpExpires) {
      res.status(400).json({ message: "OTP expired" });
    } else {
      const token = generateTokenAndUpdate(user);
      res.status(200).json({ message: "Email verified.", token, user: filterUser(user.toJSON()) });
    }
  } catch (err) {
    errorResponse(res, err);
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
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  res.status(200).json({ user: req.user });
};

/**
 * Get the currently authenticated user.
 *
 * @param {Request} req - Express request object containing user id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with user details.
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    } else {
      res.status(200).json({ user: filterUser(user.toJSON()) });
    }
  } catch (err) {
    errorResponse(res, err);
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
      res.status(400).json({ message: "A query parameter is required" });
      return;
    }

    let [users, bikes] = await Promise.all([
      searchUser(search),
      searchBike(search)
    ]);

    if (users.length === 0 && bikes.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    } else {
      const mergedSearch = mergeUsersAndBikeOwners(users, bikes);
      res.status(200).json({ results: mergedSearch });
      return;
    }
  } catch (err) {
    errorResponse(res, err);
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
    const { username, firstname, lastname, state, country, phone } =
      req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "The logged in user is not available." });
    } else {
      await user.update({
        username: username || user.username,
        firstname: firstname || user.firstname,
        lastname: lastname || user.lastname,
        state: state || user.state,
        country: country || user.country,
        phone: phone || user.phone,
      });
      res
        .status(200)
        .json({ message: "User updated successfully", user: filterUser(user.toJSON()) });
    }
  } catch (err) {
    errorResponse(res, err);
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
    const { newPassword, oldPassword } = req.body;
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    else if (!(await bcrypt.compare(oldPassword, user.password))) {
      res.status(400).json({ message: "Invalid old password" });
    } else {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await user.update({ password: hashedPassword });

      res.status(200).json({ message: "Password updated successfully" });
    }
  } catch (err) {
    errorResponse(res, err);
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
export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ where: { email } });

    if (!user || !user.isVerified) {
      res.status(404).json({
        message: "User does not exist or has not verified their email.",
      });
      return;
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: FIFTEEN_MINUTE_TOKEN,
    });

    const sent = sendPasswordResetEmail(user, token);
    res.status(200).json({ message: (await sent).message });
  } catch (err) {
    errorResponse(res, err);
  }
};

/**
 * Password Reset with OTP
 *
 * @param {Request} req - Express request object containing OTP in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns message to reset password with the user object.
 */

export const passwordResetOTP: RequestHandler = async (req, res, next) => {
  try {
    const { otp } = req.body;
    let user = await User.findOne({ where: { otp } });

    if (!user) {
      res.status(404).json({ message: "Invalid OTP" });
      return;
    }
    await generateTokenAndUpdate(user);
    res.status(200).json({ message: "Please reset your password", user: filterUser(user.toJSON()) });
    return;
  } catch (err) {
    errorResponse(res, err);
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
    const userId = req?.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else if (user.isAdmin) {
      const { userId } = req.params;
      const user = await User.findByPk(userId);
      await user.update({ isDisabled: true });
      res.status(200).json({ message: "This account has been disabled." });
    } else {
      await user.update({ isDisabled: true });
      res.status(200).json({ message: "This account has been disabled." });
    }
  } catch (err) {
    errorResponse(res, err);
  }
};

export const getUserInvites = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const invitations = await GroupInvitation.findAll({
      where: { userId },
      include: [{ model: Group, attributes: ["id", "name"] }],
    });
    res.status(200).json({ invitations });
    return;
  } catch (err) {
    errorResponse(res, err);
  }
};
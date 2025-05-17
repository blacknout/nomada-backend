import express from "express";
import { 
  register,
  login,
  verifyOtp,
  getCurrentUser,
  getUser,
  searchUsers,
  updateUser,
  changePassword,
  resetPassword,
  passwordResetOTP,
  disableUser,
  getUserInvites
} from "../controllers/userController";
import { 
  validateRegisterUser, 
  validateLoginUser, 
  validateUpdateUser,
  validateChangePassword,
  validateResetPassword,
  validatePasswordOTP,
  validateUserQuery,
  validateSearchQuery
} from "../middleware/userValidation";
import { authenticateUser } from '../middleware/auth'

const router = express.Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstname
 *               - lastname
 *               - state
 *               - country
 *               - avatar
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       201:
 *         description: Check your email for a confirmation code.
 *       409:
 *         description: Email already in use
 *       400:
 *         description: Password must be at least 6 characters.
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/register", validateRegisterUser, register);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Token
 *       409:
 *         description: Email already in use
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/login", validateLoginUser, login);


/**
 * @swagger
 * /api/user/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified.
 *       400: 
 *         description: |
 *           Invalid OTP or OTP expired
 *           Possible reasons:
 *           - The OTP is invalid
 *           - The OTP has expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 * 
 */
router.post("/verify-otp", verifyOtp);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get details of the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 isDisabled:
 *                   type: string
 *                 state:
 *                   type: string
 *                 country:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/me", authenticateUser, getCurrentUser);

/**
 * @swagger
 * /api/user/invites:
 *   get:
 *     summary: Get current user group invites
 *     description: All requests to join a group sent to this user.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: invitations
 *       401:
 *         description: Access Denied. No Token Provided.
 *       404:
 *         description: Invitation not found
 *       500:
 *         description: Internal server error
 */
router.get("/invites",
  authenticateUser,
  getUserInvites);

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: Get details of a user by userId
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: userId
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 isDisabled:
 *                   type: string
 *                 state:
 *                   type: string
 *                 country:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get("/:id", authenticateUser, validateUserQuery, getUser);

/**
 * @swagger
 * /api/user/:
 *   get:
 *     summary: Search users by username, firstname, lastname or bike plate number
 *     description: Returns a list of users or bike matching the search query.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: true
 *         description: username of the user to search for
 *     responses:
 *       200:
 *         description: List of users matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       firstname:
 *                         type: string
 *                       lastname:
 *                         type: string
 *       400:
 *         description: A query parameter is required
 *       404:
 *         description: No users found
 *       500:
 *         description: Internal server error
 */
router.get("/", authenticateUser, validateSearchQuery, searchUsers);

/**
 * @swagger
 * /api/user/{userId}:
 *   put:
 *     summary: Update user details
 *     description: Updates the details of a user by their ID. Authenticated users can only update their own details.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update.
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         description: Fields to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               example: John.Stan.Man
 *             firstname:
 *               type: string
 *               example: John
 *             lastname:
 *               type: string
 *               example: Doe
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             phone:
 *               type: string
 *             avatar:
 *               type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized action
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/", authenticateUser, validateUpdateUser, updateUser);

/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change password
 *     description: Updates the users password.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: body
 *         name: password
 *         description: Fields to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *               example: password123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/change-password",  authenticateUser, validateChangePassword, changePassword);

/**
 * @swagger
 * /api/user/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Sends the user a reset password link.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: body
 *         name: email
 *         description: Fields to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: samd2121@gmail.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset link sent successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: No user with this email exists.
 *       500:
 *         description: Internal server error
 */
router.post("/reset-password", validateResetPassword, resetPassword);


/**
 * @swagger
 * /api/user/password-reset-otp:
 *   post:
 *     summary: Password reset OTP
 *     description: User OTP is confirmed and he is logged in to update password
 *     tags:
 *       - Users
 *     parameters:
 *       - in: body
 *         name: otp
 *         description: Fields to update
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             otp:
 *               type: string
 *               example: 234323
 *     responses:
 *       200:
 *         description: Please reset your password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please reset your password
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Invalid OTP
 *       500:
 *         description: Internal server error
 */
router.post("/password-reset-otp", validatePasswordOTP, passwordResetOTP);

/**
 * @swagger
 * /api/user/disable/{userId}:
 *   put:
 *     summary: Disable a user
 *     description: A user can only disable their own account unless they are an admin user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: The user ID if it is an admin user
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: This account has been disabled.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This account has been disabled.
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/disable/:id", authenticateUser, disableUser);

export default router;

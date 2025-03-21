"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const userValidation_1 = require("../middleware/userValidation");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
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
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already in use
 *       400:
 *         description: Password must be at least 6 characters.
 *
 */
router.post("/register", userValidation_1.validateRegisterUser, userController_1.register);
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
 *
 */
router.post("/login", userValidation_1.validateLoginUser, userController_1.login);
/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get details of the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
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
 */
router.get("/me", auth_1.authenticateUser, userController_1.getCurrentUser);
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
 *       - BearerAuth: []
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
 */
router.get("/:userId", auth_1.authenticateUser, userController_1.getUser);
/**
 * @swagger
 * /api/user/:
 *   get:
 *     summary: Search users by username, firstname or lastname
 *     description: Returns a list of users matching the search query.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: true
 *         description: usernmae of the user to search for
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
 *         description: Bad request - missing name query parameter
 *       404:
 *         description: No users found
 *       500:
 *         description: Internal server error
 */
router.get("/", auth_1.authenticateUser, userController_1.searchUsers);
/**
 * @swagger
 * /api/user/{userId}:
 *   put:
 *     summary: Update user details
 *     description: Updates the details of a user by their ID. Authenticated users can only update their own details.
 *     tags:
 *       - Users
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
 *             email:
 *               type: string
 *               example: johndoe@example.com
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
router.put("/:userId", auth_1.authenticateUser, userValidation_1.validateUpdateUser, userController_1.updateUser);
/**
 * @swagger
 * /api/user/change-password:
 *   put:
 *     summary: Change password
 *     description: Updates the users password.
 *     tags:
 *       - Users
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
router.put("/change-password", auth_1.authenticateUser, userValidation_1.validateChangePassword, userController_1.changePassword);
/**
 * @swagger
 * /api/user/disable/{userId}:
 *   put:
 *     summary: Disable a user
 *     description: A user can only disable their own account unless they are an admin user.
 *     tags:
 *       - Users
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
router.put("/disable/:userId", auth_1.authenticateUser, userController_1.disableUser);
exports.default = router;

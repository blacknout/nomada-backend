"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableUser = exports.changePassword = exports.updateUser = exports.searchUsers = exports.getUser = exports.getCurrentUser = exports.login = exports.register = void 0;
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Registers a new user.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with user details or error
 */
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.create(req.body);
        res.status(201).json({ message: "User registered", user });
    }
    catch (err) {
        next(err);
    }
});
exports.register = register;
/**
 * User Login.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with user token
 */
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ where: { email: req.body.email } });
        if (!user || !(yield bcryptjs_1.default.compare(req.body.password, user.password))) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, user: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
/**
 * Get the currently authenticated user.
 *
 * @param {Request} req - Express request object, should contain `user` in `req.user` from auth middleware.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with user details.
 */
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ user: req.user });
});
exports.getCurrentUser = getCurrentUser;
/**
 * Get the currently authenticated user.
 *
 * @param {Request} req - Express request object containing user id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with user details.
 */
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        next(err);
    }
});
exports.getUser = getUser;
/**
 * Get the currently authenticated user.
 *
 * @param {Request} req - null
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns Array with users that match query.
 */
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        if (!search || typeof search !== "string") {
            res.status(400).json({ message: "a query parameter is required" });
        }
        const users = yield User_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { username: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { firstname: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { lastname: { [sequelize_1.Op.iLike]: `%${search}%` } },
                ],
            },
            attributes: ["id", "username", "firstname", "lastname"],
        });
        if (users.length === 0) {
            res.status(404).json({ message: "No users found" });
        }
        else {
            res.status(200).json({ users });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.searchUsers = searchUsers;
/**
 * Update users details.
 *
 * @param {Request} req - Express request object containing user data in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns updated user.
 */
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username, email, firstname, lastname, state, country } = req.body;
        const user = yield User_1.default.findByPk(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        else if (id !== req.user.id && !user.isAdmin) {
            res.status(401).json({ message: "Unauthorized action" });
        }
        else {
            yield user.update({ username, email, firstname, lastname, state, country });
            res.status(200).json({ message: "User updated successfully", user });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
/**
 * Update users password.
 *
 * @param {Request} req - Express request object containing user password in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns success message.
 */
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { newPassword } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
        }
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        else {
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            yield user.update({ password: hashedPassword });
            res.status(200).json({ message: "Password updated successfully" });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.changePassword = changePassword;
/**
 * Disable account.
 *
 * @param {Request} req - Express request object containing userId in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns success message.
 */
const disableUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
        }
        const user = yield User_1.default.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        else if (user.isAdmin) {
            const { userId } = req.params;
            const user = yield User_1.default.findByPk(userId);
            yield user.update({ isDisabled: true });
            res.status(200).json({ message: "This account has been disabled." });
        }
        else {
            yield user.update({ isDisabled: true });
            res.status(200).json({ message: "This account has been disabled." });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.disableUser = disableUser;

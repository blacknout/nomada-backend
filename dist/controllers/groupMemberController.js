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
exports.leaveGroup = exports.removeUserFromGroup = exports.addUserToGroup = exports.getGroupUsers = exports.joinGroup = void 0;
const Group_1 = __importDefault(require("../models/Group"));
const GroupMembers_1 = __importDefault(require("../models/GroupMembers"));
const User_1 = __importDefault(require("../models/User"));
/**
 * Join a group.
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */
const joinGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { groupId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const group = yield Group_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
        }
        else {
            const isMember = yield GroupMembers_1.default.findOne({ where: { userId, groupId } });
            if (isMember) {
                res.status(400).json({ message: "User is already in the group" });
            }
            yield GroupMembers_1.default.create({ userId, groupId });
            res.status(200).json({ message: "Successfully joined the group" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.joinGroup = joinGroup;
/**
 * get group members.
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with group users or error
 */
const getGroupUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const group = yield Group_1.default.findByPk(groupId, {
            include: [
                {
                    model: User_1.default,
                    attributes: ["id", "username", "firstname", "lastname"],
                    through: { attributes: [] },
                    as: "users",
                },
            ],
        });
        if (!group) {
            res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json({ users: group.users });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.getGroupUsers = getGroupUsers;
/**
 * Add a user to a group.
 *
 * @param {Request} req - Express request object containing group Id and user Id in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */
const addUserToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId, userId } = req.body;
        const group = yield Group_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
        }
        if (req.user && req.user.is == group.createdBy) {
            const user = yield User_1.default.findByPk(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
            }
            const existingMembership = yield GroupMembers_1.default.findOne({ where: { groupId, userId } });
            if (existingMembership) {
                res.status(400).json({ message: "User is already in the group" });
            }
            else {
                yield GroupMembers_1.default.create({ groupId, userId });
                res.status(201).json({ message: "User added to group successfully" });
            }
        }
        else {
            res.status(401).json({ message: "You are not allowed to add users to this group." });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.addUserToGroup = addUserToGroup;
/**
 * Remove a user from a group
 *
 * @param {Request} req - Express request object containing group Id and user Id in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */
const removeUserFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId, userId } = req.body;
        const group = yield Group_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
        }
        if (req.user && req.user.is == group.createdBy) {
            const membership = yield GroupMembers_1.default.findOne({ where: { groupId, userId } });
            if (!membership) {
                res.status(404).json({ message: "User is not in the group" });
            }
            yield GroupMembers_1.default.destroy({ where: { groupId, userId } });
            res.status(200).json({ message: "User removed from group successfully" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.removeUserFromGroup = removeUserFromGroup;
/**
 * Leave a group
 *
 * @param {Request} req - Express request object containing group Id in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with success message or error
 */
const leaveGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { groupId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
        }
        else {
            const membership = yield GroupMembers_1.default.findOne({ where: { groupId, userId } });
            if (!membership) {
                res.status(404).json({ message: "You are not a member of this group" });
            }
            yield GroupMembers_1.default.destroy({ where: { groupId, userId } });
            res.status(200).json({ message: "You have left the group successfully" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.leaveGroup = leaveGroup;

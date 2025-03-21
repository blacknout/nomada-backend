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
exports.deleteGroup = exports.getCurrentUserGroups = exports.updateGroupDetails = exports.getGroup = exports.createGroup = void 0;
const Group_1 = __importDefault(require("../models/Group"));
const GroupMembers_1 = __importDefault(require("../models/GroupMembers"));
/**
 * Create a new group.
 *
 * @param {Request} req - Express request object containing group data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with group details or error
 */
const createGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, description } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
        }
        const group = yield Group_1.default.create({
            name: String(name),
            description: description ? String(description) : null,
            createdBy: String(userId),
        });
        yield GroupMembers_1.default.create({ groupId: group.id, userId });
        res.status(201).json({ message: "Group created successfully", group });
    }
    catch (err) {
        next(err);
    }
});
exports.createGroup = createGroup;
/**
 * get group details.
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with group details or error
 */
const getGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const group = yield Group_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json({ group });
    }
    catch (error) {
        console.error("Error fetching group:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getGroup = getGroup;
/**
 * Update group details.
 *
 * @param {Request} req - Express request object containing group data in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns updated group details.
 */
const updateGroupDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const { name, description } = req.body;
        const group = yield Group_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
        }
        else if (req.user && req.user.id === group.createdBy) {
            yield group.update({
                name: name || group.name,
                description: description || group.description,
            });
            res.status(200).json({ message: "Group updated successfully", group });
        }
    }
    catch (error) {
        console.error("Error updating group:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateGroupDetails = updateGroupDetails;
/**
 * Get the currently authenticated users group.
 *
 * @param {Request} req - null
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with group details.
 */
const getCurrentUserGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user || !req.user.id) {
            res.status(403).json({ message: "Unauthorized" });
        }
        else {
            const createdBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const groups = yield Group_1.default.findAll({ where: { createdBy } });
            if (!groups.length) {
                res.status(404).json({ message: "No groups found for this user" });
            }
            res.status(200).json({ groups });
        }
    }
    catch (error) {
        console.error("Error fetching current user's groups:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getCurrentUserGroups = getCurrentUserGroups;
/**
 * Delete group by the creator
 *
 * @param {Request} req - Express request object containing group id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with success message.
 */
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupId } = req.params;
        const group = yield Group_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
        }
        else if (req.user && req.user.id === group.createdBy) {
            yield group.destroy();
            res.status(200).json({ message: "Group has been deleted." });
        }
    }
    catch (error) {
        console.error("Error updating bike:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deleteGroup = deleteGroup;

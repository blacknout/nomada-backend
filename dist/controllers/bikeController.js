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
exports.removeBike = exports.getCurrentUserBikes = exports.getUserBikes = exports.updateBike = exports.getBike = exports.createBike = void 0;
const Bike_1 = __importDefault(require("../models/Bike"));
const User_1 = __importDefault(require("../models/User"));
/**
 * Create a new bike.
 *
 * @param {Request} req - Express request object containing bike data in req.body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with bike details or error
 */
const createBike = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { plateNumber, make, model, year } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const notInUse = false;
        const newBike = yield Bike_1.default.create({
            plateNumber,
            make,
            model,
            year,
            userId,
            notInUse
        });
        res.status(201).json({
            message: "Bike created successfully.",
            bike: newBike,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createBike = createBike;
/**
 * get a bike.
 *
 * @param {Request} req - Express request object containing bike id in req.params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<Response>} - Returns JSON response with bike details or error
 */
const getBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bikeId } = req.params;
        const bike = yield Bike_1.default.findByPk(bikeId, {
            include: [{ model: User_1.default, attributes: ["id", "username"] }],
        });
        if (!bike) {
            res.status(404).json({ message: "Bike not found" });
        }
        res.status(200).json({ bike });
    }
    catch (error) {
        console.error("Error fetching bike:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getBike = getBike;
/**
 * Update bike details.
 *
 * @param {Request} req - Express request object containing bike data in req.body
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns updated bike.
 */
const updateBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bikeId } = req.params;
        const { plateNumber, make, model, year } = req.body;
        const bike = yield Bike_1.default.findByPk(bikeId);
        if (!bike) {
            res.status(404).json({ message: "Bike not found" });
        }
        else if (req.user && req.user.id === bike.userId) {
            yield bike.update({
                plateNumber: plateNumber || bike.plateNumber,
                make: make || bike.make,
                model: model || bike.model,
                year: year || bike.year,
            });
            res.status(200).json({ message: "Bike updated successfully", bike });
        }
    }
    catch (error) {
        console.error("Error updating bike:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateBike = updateBike;
/**
 * Get a users bike.
 *
 * @param {Request} req - Express request object containing user id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with bike details.
 */
const getUserBikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const bikes = yield Bike_1.default.findAll({ where: { userId, notInUse: false } });
        if (!bikes.length) {
            res.status(404).json({ message: "No bikes found for this user" });
        }
        res.status(200).json({ bikes });
    }
    catch (error) {
        console.error("Error fetching user's bikes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getUserBikes = getUserBikes;
/**
 * Get the currently authenticated users bike.
 *
 * @param {Request} req - null
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with bike details.
 */
const getCurrentUserBikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user || !req.user.id) {
            res.status(403).json({ message: "Unauthorized" });
        }
        else {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const bikes = yield Bike_1.default.findAll({ where: { userId, notInUse: false } });
            if (!bikes.length) {
                res.status(404).json({ message: "No bikes found for this user" });
            }
            res.status(200).json({ bikes });
        }
    }
    catch (error) {
        console.error("Error fetching current user's bikes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getCurrentUserBikes = getCurrentUserBikes;
/**
 * Set bike to not in user
 *
 * @param {Request} req - Express request object containing bike id in req.params
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response>} - Returns JSON response with success message.
 */
const removeBike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bikeId } = req.params;
        const bike = yield Bike_1.default.findByPk(bikeId);
        if (!bike) {
            res.status(404).json({ message: "Bike not found" });
        }
        else if (req.user && req.user.id === bike.userId) {
            yield bike.update({
                notInUse: true
            });
            res.status(200).json({ message: "Bike has been removed." });
        }
    }
    catch (error) {
        console.error("Error updating bike:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.removeBike = removeBike;

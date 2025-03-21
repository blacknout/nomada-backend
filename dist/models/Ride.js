"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ride = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const User_1 = require("./User");
const Group_1 = require("./Group");
class Ride extends sequelize_1.Model {
}
exports.Ride = Ride;
Ride.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    groupId: { type: sequelize_1.DataTypes.UUID, allowNull: false, references: { model: Group_1.Group, key: "id" } },
    createdBy: { type: sequelize_1.DataTypes.UUID, allowNull: false, references: { model: User_1.User, key: "id" } },
    roadCaptainId: { type: sequelize_1.DataTypes.UUID, references: { model: User_1.User, key: "id" } },
    route: { type: sequelize_1.DataTypes.JSONB },
    startLocation: { type: sequelize_1.DataTypes.JSONB, },
    destination: { type: sequelize_1.DataTypes.JSONB, },
    status: {
        type: sequelize_1.DataTypes.ENUM("pending", "ongoing", "completed"),
        defaultValue: "pending",
        allowNull: false,
    },
}, { sequelize: sequelize_2.default, modelName: "ride", timestamps: true });

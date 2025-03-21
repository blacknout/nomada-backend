"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const User_1 = require("./User");
class Group extends sequelize_1.Model {
}
exports.Group = Group;
Group.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    description: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    createdBy: { type: sequelize_1.DataTypes.UUID, allowNull: false, references: { model: User_1.User, key: "id" } },
}, { sequelize: sequelize_2.default, modelName: "group", timestamps: true });
exports.default = Group;

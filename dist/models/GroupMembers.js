"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMember = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
const User_1 = require("./User");
const Group_1 = require("./Group");
class GroupMember extends sequelize_1.Model {
}
exports.GroupMember = GroupMember;
GroupMember.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    userId: { type: sequelize_1.DataTypes.UUID, allowNull: false, references: { model: User_1.User, key: "id" } },
    groupId: { type: sequelize_1.DataTypes.UUID, allowNull: false, references: { model: Group_1.Group, key: "id" } },
}, { sequelize: sequelize_2.default, modelName: "group_member", timestamps: true });
exports.default = GroupMember;

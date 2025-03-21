import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";
import { Group } from "./Group";

interface GroupMemberAttributes {
    id: string;
    userId: string;
    groupId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class GroupMember extends Model<GroupMemberAttributes> implements GroupMemberAttributes {
    public id!: string;
    public userId!: string;
    public groupId!: string;
}

GroupMember.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
        groupId: { type: DataTypes.UUID, allowNull: false, references: { model: Group, key: "id" } },
    },
    { sequelize, modelName: "group_member", timestamps: true }
);

export default GroupMember;
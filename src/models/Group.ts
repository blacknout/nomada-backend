import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";
import { GroupMember } from "./GroupMembers";

interface GroupAttributes {
    id: string;
    name: string;
    description?: string | null;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Group extends Model<GroupAttributes> implements GroupAttributes {
    public id!: string;
    public name!: string;
    public description?: string;
    public createdBy!: string;
    public users?: User[]
}

Group.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true },
        createdBy: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
    },
    { sequelize, modelName: "group", timestamps: true }
);

export default Group;
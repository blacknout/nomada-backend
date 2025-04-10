import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";

interface GroupAttributes {
	id: string;
	name: string;
	description?: string | null;
	isPrivate: boolean;
	isRestricted: boolean;
	createdBy: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export class Group extends Model<GroupAttributes> implements GroupAttributes {
	public id!: string;
	public name!: string;
	public description?: string;
	public isPrivate!: boolean;
	public isRestricted!: boolean;
	public createdBy!: string;
	public users?: User[]
}

Group.init(
	{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			name: { type: DataTypes.STRING, allowNull: false },
			description: { type: DataTypes.TEXT, allowNull: true },
			isPrivate: { type: DataTypes.BOOLEAN, defaultValue: false },
			isRestricted: { type: DataTypes.BOOLEAN, defaultValue: false },
			createdBy: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
	},
	{ sequelize, modelName: "group", timestamps: true }
);

export default Group;
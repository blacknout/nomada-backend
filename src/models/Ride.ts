import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";
import { Group } from "./Group";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface RideAttributes {
    id: string;
    groupId: string;
    createdBy: string;
    roadCaptainId: string;
    route: Coordinates[];
    startLocation: Coordinates;
    destination: Coordinates;
    status: "pending" | "ongoing" | "completed";
    createdAt?: Date;
    updatedAt?: Date;
}

interface RideCreationAttributes extends Optional<RideAttributes, "id"> {}

export class Ride extends Model<RideAttributes, RideCreationAttributes>  implements RideAttributes {
    public id!: string;
    public groupId!: string;
    public createdBy!: string;
    public roadCaptainId!: string;
    public route!: Coordinates[];
    public startLocation!: Coordinates;
    public destination!: Coordinates;
    public status!: "pending" | "ongoing" | "completed";
}

Ride.init(
    {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        groupId: { type: DataTypes.UUID, allowNull: false, references: { model: Group, key: "id" } },
        createdBy: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
        roadCaptainId: { type: DataTypes.UUID, references: { model: User, key: "id" } },
        route: { type: DataTypes.JSONB },
        startLocation: { type: DataTypes.JSONB, },
        destination: { type: DataTypes.JSONB, },
        status: {
          type: DataTypes.ENUM("pending", "ongoing", "completed"),
          defaultValue: "pending",
          allowNull: false,
        },
      
    },
    { sequelize, modelName: "ride", timestamps: true }
);

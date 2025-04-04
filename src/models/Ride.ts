import { DataTypes, Model, Optional, Association } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";
import { Group } from "./Group";

interface Coordinates {
  lat: number;
  lng: number;
}

interface RideAttributes {
    id: string;
    name: string;
    groupId: string;
    createdBy: string;
    roadCaptainId?: string;
    route?: Coordinates[];
    startLocation?: Coordinates;
    destination?: Coordinates;
    status: "pending" | "started" | "completed";
    createdAt?: Date;
    updatedAt?: Date;
}

interface RideCreationAttributes extends Optional<RideAttributes, "id"> {}

export class Ride extends Model<RideAttributes, RideCreationAttributes>  implements RideAttributes {
    public id!: string;
    public name!: string;
    public groupId!: string;
    public createdBy!: string;
    public roadCaptainId: string;
    public route: Coordinates[];
    public startLocation: Coordinates;
    public destination: Coordinates;
    public status!: "pending" | "started" | "completed";

    public static associations: {
      participants: Association<Ride, User>;
    };
}

Ride.init(
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      groupId: { type: DataTypes.UUID, allowNull: false, references: { model: Group, key: "id" } },
      createdBy: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
      roadCaptainId: { type: DataTypes.UUID, references: { model: User, key: "id" } },
      route: { type: DataTypes.JSONB },
      startLocation: { type: DataTypes.JSONB, },
      destination: { type: DataTypes.JSONB, },
      status: {
        type: DataTypes.ENUM("pending", "started", "completed"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    { sequelize, modelName: "ride", timestamps: true }
);

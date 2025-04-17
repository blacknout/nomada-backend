import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/sequelize";
import { Ride } from "./Ride";
import { User } from "./User";


interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RideStopAttributes {
  id: string;
  rideId: string;
  userId: string;
  reason?: "safe" | "accident" | "mechanical";
  location: Coordinates;
  isResolved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RideStopCreationAttributes
  extends Optional<RideStopAttributes, "id"> {}

export class RideStop extends Model<RideStopAttributes, RideStopCreationAttributes> 
  implements RideStopAttributes {
  public id!: string;
  public rideId!: string;
  public userId!: string;
  public reason?: "safe" | "accident" | "mechanical";
  public location!: Coordinates;
  public isResolved!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RideStop.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rideId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Ride, key: "id" },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
    },
    reason: {
      type: DataTypes.ENUM("safe", "accident", "mechanical", "unknown"),
      allowNull: false,
      defaultValue: "unknown"
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "RideStop",
    tableName: "ride_stops",
  }
);

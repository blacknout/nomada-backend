import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";

interface BikeAttributes {
  id: string;
  userId: string;
	plateNumber: string
	make:  string
	model: string
	year : string
	notInUse:  boolean
  createdAt?: Date;
  updatedAt?: Date;
}

interface BikeCreationAttributes extends Optional<BikeAttributes, "id"> {}


export class Bike extends Model<BikeAttributes, BikeCreationAttributes> implements BikeAttributes {
  public id!: string;
  public userId!: string;
  public plateNumber!: string;
  public make!: string;
  public model!: string;
  public year!: string;
  public notInUse!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Bike.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    plateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notInUse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "bikes",
  }
);

export default Bike;

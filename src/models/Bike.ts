import {
  DataTypes,
  Model,
  Optional,
  Association
 } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";

interface BikeAttributes {
  id:         string;
  userId:     string;
	plate?:     string;
	make:       string;
	model:      string;
  color?:     string;
	year:       string;
  vin?:       string;
  stolen:     boolean;
	notInUse:   boolean;
  images?:    string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface BikeCreationAttributes extends Optional<BikeAttributes, "id"> {}


export class Bike extends Model<BikeAttributes, BikeCreationAttributes> implements BikeAttributes {
  public id!:                 string;
  public userId!:             string;
  public plate?:              string;
  public make!:               string;
  public model!:              string;
  public color?:              string;
  public year!:               string;
  public vin?:                string;
  public stolen:              boolean;
  public notInUse!:           boolean;
  public images?:             string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public owner?: User;

  public static associations: {
    owner: Association<Bike, User>;
  };
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
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    plate: {
      type: DataTypes.STRING,
      unique: false,
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vin: {
      type: DataTypes.STRING,
      unique: true,
    },
    stolen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    notInUse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "bikes",
  }
);

export default Bike;

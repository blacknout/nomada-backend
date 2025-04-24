import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/sequelize";

interface BikeAttributes {
  id: string;
  userId: string;
	plate?: string
	make:  string
	model: string
  color?: string
	year: string
  vin?: string
	notInUse:  boolean
  image?: string
  createdAt?: Date;
  updatedAt?: Date;
}

interface BikeCreationAttributes extends Optional<BikeAttributes, "id"> {}


export class Bike extends Model<BikeAttributes, BikeCreationAttributes> implements BikeAttributes {
  public id!: string;
  public userId!: string;
  public plate?: string;
  public make!: string;
  public model!: string;
  public color?: string;
  public year!: string;
  public vin?: string;
  public notInUse!: boolean;
  public image?: string;
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
    plate: {
      type: DataTypes.STRING,
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
    color: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vin: {
      type: DataTypes.STRING,
    },
    notInUse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    image: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    tableName: "bikes",
  }
);

export default Bike;

import { DataTypes, Model } from "sequelize";
import { User } from "./User";

const sequelize = require('../config/sequelize');

interface SosAttributes {
	id: string;
	isActivated: boolean;
  contactId?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  userId: string;
  createdAt?: Date;
	updatedAt?: Date;
}

export class Sos extends Model<SosAttributes> {
  public id!: string;
  public isActivated!: boolean;
  public contactId?: string;
  public contactName?: string;
  public email?: string;
  public phone?: string;
  public userId!: string;
	public createdAt?: Date;
	public updatedAt?: Date;
}

Sos.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    isActivated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    contactId: { type: DataTypes.UUID, references: { model: User, key: "id" } },
    contactName: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
  },
  { 
    sequelize, 
    modelName: "sos",
    timestamps: true,
  }
);

export default Sos;
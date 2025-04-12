import { DataTypes, Model, Association } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";

interface SosAttributes {
	id: string;
	isActivated: boolean;
  contactId?: string;
  email?: string;
  phone?: string;
  userId: string;
}

export class Sos extends Model<SosAttributes> {
  public id!: string;
  public isActivated!: boolean;
  public contactId?: string;
  public email?: string;
  public phone?: string;
  public userId!: string;
}

Sos.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    isActivated: { type: DataTypes.BOOLEAN, allowNull: false },
    contactId: { type: DataTypes.UUID, references: { model: User, key: "id" } },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
  },
  { sequelize, modelName: "sos", timestamps: true }
);

export default Sos;
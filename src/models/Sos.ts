import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";

interface SosAttributes {
	id: string;
	isActivated: boolean;
  contactId?: string;
  contactUsername: string;
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
  public contactUsername: string;
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
    contactUsername: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
  },
  { 
    sequelize, 
    modelName: "sos",
    timestamps: true,

    hooks: {
      beforeCreate: async (sos: Sos) => {
        if (!sos.contactUsername) {
          const contact = await User.findByPk(sos.contactId);
          sos.contactUsername = contact.username;
        }
      },
    },
  }
);

export default Sos;
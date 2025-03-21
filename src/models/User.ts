import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import bcrypt from "bcryptjs";

interface UserAttributes {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isDisabled: boolean;
  state: string;
  country: string;
  isAdmin: boolean;
}

export class User extends Model<UserAttributes> {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public firstname!: string;
  public lastname!: string;
  public isDisabled!: boolean;
  public state!: string;
  public country!: string;
  public isAdmin!: boolean;
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    isDisabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    state: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    modelName: "User",
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

export default User;

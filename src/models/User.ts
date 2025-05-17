import {
  DataTypes,
  Model,
  Association,
  HasManyGetAssociationsMixin
 } from "sequelize";
import sequelize from "../config/sequelize";
import bcrypt from "bcryptjs";
import { Bike } from "./Bike";
import { Ride } from "./Ride";
import { Sos } from "./Sos";

interface UserAttributes {
  id:           string;
  username:     string;
  firstname:    string;
  lastname:     string;
  email:        string;
  password:     string;
  state:        string;
  country:      string;
  phone?:       string;
  token?:       string;
  isAdmin:      boolean;
  avatar?:      string;
  otp?:         string;
  otpExpires?:  Date;
  isVerified:   boolean;
  isDisabled:   boolean;
  pushToken?:   string;
}

export class User extends Model<UserAttributes> {
  public id!:           string;
  public username!:     string;
  public email!:        string;
  public password!:     string;
  public firstname!:    string;
  public lastname!:     string;
  public state!:        string;
  public country!:      string;
  public phone?:        string;
  public token?:        string;
  public isAdmin!:      boolean;
  public avatar?:       string;
  public otp?:          string;
  public otpExpires?:   Date;
  public isVerified!:   boolean;
  public isDisabled!:   boolean;
  public pushToken?:    string;

  public getBikes!:     HasManyGetAssociationsMixin<Bike>;

  public bikes?:        Bike[];

  public getSos!:       HasManyGetAssociationsMixin<Sos>;
  public sos?:          Sos[];

  public static associations: {
    bikes: Association<User, Bike>;
    rides: Association<User, Ride>;
  };
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    token: { type: DataTypes.TEXT, allowNull: true },
    avatar: { type: DataTypes.STRING },
    isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    otp: { type: DataTypes.STRING,},
    otpExpires: { type: DataTypes.DATE,},
    isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isDisabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    pushToken: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",

    defaultScope: {
      attributes: { exclude: ["password"], },
    },
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

export default User;

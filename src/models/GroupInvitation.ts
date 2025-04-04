import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";
import { Group } from "./Group";

export class GroupInvitation extends Model {
  public id!: string;
  public userId!: string;
  public groupId!: string;
}

GroupInvitation.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
    groupId: { type: DataTypes.UUID, allowNull: false, references: { model: Group, key: "id" } },
  },
  { sequelize, modelName: "group_invitation" }
);

export default GroupInvitation;
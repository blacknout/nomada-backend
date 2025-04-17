import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/sequelize";

interface NotificationAttributes {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: "sos" | "message" | "invite";
  data?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, "id" | "isRead" | "data"> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public message!: string;
  public isRead!: boolean;
  public type!: "sos" | "message" | "invite";
  public data?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM("sos", "message", "invite"),
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
  }
);

export default Notification;

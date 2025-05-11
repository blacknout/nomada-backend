import { DataTypes, Model, Optional } from "sequelize";
import { 
  NotificationType,
  NotificationPriority,
} from '../@types/model';

const sequelize = require('../config/sequelize');

interface NotificationAttributes {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  readDate: string;
  priority: NotificationPriority;
  data?: any;
}

interface NotificationCreationAttributes
  extends Optional<NotificationAttributes, 'id' | 'createdAt' | 'read' | 'data'> {}

export class Notification
extends Model<NotificationAttributes, NotificationCreationAttributes>
implements NotificationAttributes {
id!: string;
userId?: string;
type!: NotificationType;
title!: string;
message!: string;
createdAt!: string;
read!: boolean;
readDate: string;
priority!: NotificationPriority;
data?: any;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'invite',
        'message',
        'upcoming-ride',
        'sos',
        'group-update',
         'search-vin',
         'system'),
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
    createdAt: {
      type: DataTypes.STRING,
      defaultValue: () => new Date().toISOString(),
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'low',
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    modelName: 'Notification',
  }
);

export default Notification;

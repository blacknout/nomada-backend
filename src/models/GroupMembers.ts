import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";
import { Group } from "./Group";
import { 
  GroupMemberType
} from '../@types/model';

interface GroupMemberAttributes {
  id: string;
  userId: string;
  groupId: string;
  type: GroupMemberType;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GroupMember extends Model<GroupMemberAttributes> implements GroupMemberAttributes {
  public id!: string;
  public userId!: string;
  public groupId!: string;
  public type!:  GroupMemberType;
}

GroupMember.init(
  {
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
    userId: { 
      type: DataTypes.UUID, allowNull: false, 
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    groupId: { 
      type: DataTypes.UUID, allowNull: false,
      references: { model: Group, key: "id" },
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("active", "ghost", "observer", "inactive" ),
      allowNull: false,
      defaultValue: "ghost"
    },
  },
  { sequelize, 
    modelName: "group_member", 
    timestamps: true,
    hooks: {
      beforeCreate: async (groupMember: GroupMember, options) => {
        if (groupMember.type) return;
      
        const group = await Group.findByPk(groupMember.groupId);
      
        if (!group) throw new Error('Group not found');
      
        if (group.isRestricted && group.createdBy !== groupMember.userId) {
          groupMember.type = 'observer';
        } else {
          groupMember.type = 'active';
        }
      }
    }
  }
);

export default GroupMember;
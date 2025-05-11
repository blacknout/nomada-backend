import { 
  DataTypes,
  Model,
  Optional,
  Association,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
} from "sequelize";
import sequelize from "../config/sequelize";
import { User } from "./User";
import { Group } from "./Group";
import { Location } from "../@types/location";
import { 
  RideStatusType
} from '../@types/model';

interface RideAttributes {
  id: string;
  name: string;
  groupId: string;
  createdBy: string;
  roadCaptainId?: string;
  route?: Location[];
  startLocation?: Location;
  destination?: Location;
  status: RideStatusType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RideCreationAttributes extends Optional<RideAttributes, "id"> {}

export class Ride extends Model<RideAttributes, RideCreationAttributes>  implements RideAttributes {
    public id!: string;
    public name!: string;
    public groupId!: string;
    public createdBy!: string;
    public roadCaptainId: string;
    public route: Location[];
    public startLocation: Location;
    public destination: Location;
    public status!: RideStatusType;

    public getParticipants!: BelongsToManyGetAssociationsMixin<User>;
    public addParticipant!: BelongsToManyAddAssociationMixin<User, string>;
    public addParticipants!: BelongsToManyAddAssociationsMixin<User, string>;

    public participants?: User[];

    public static associations: {
      participants: Association<Ride, User>;
    };
}

Ride.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    groupId: { type: DataTypes.UUID, allowNull: false, references: { model: Group, key: "id" } },
    createdBy: { type: DataTypes.UUID, allowNull: false, references: { model: User, key: "id" } },
    roadCaptainId: { type: DataTypes.UUID, references: { model: User, key: "id" } },
    route: { type: DataTypes.JSONB },
    startLocation: { type: DataTypes.JSONB, },
    destination: { type: DataTypes.JSONB, },
    status: {
      type: DataTypes.ENUM("pending", "started", "completed"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  { sequelize, modelName: "ride", timestamps: true }
);

export default Ride;
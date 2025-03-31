import { User } from "./User";
import { Bike } from "./Bike";
import { Group } from "./Group";
import { GroupMember } from "./GroupMembers";
import { Ride } from "./Ride";
import { RideStop } from "./RideStop";

// A User owns many Bikes
User.hasMany(Bike, { foreignKey: "userId", onDelete: "CASCADE" });
Bike.belongsTo(User, { foreignKey: "userId" });

// A User can create many Groups
User.hasMany(Group, { foreignKey: "createdBy", onDelete: "CASCADE" });
Group.belongsTo(User, { foreignKey: "createdBy" });

// A User can be in many Groups (through GroupMember)
User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId", onDelete: "CASCADE"});
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId", as: "users", onDelete: "CASCADE" });

// A Group has many Rides
Group.hasMany(Ride, { foreignKey: "groupId", onDelete: "CASCADE" });
Group.hasMany(GroupMember, { foreignKey: "groupId",onDelete: "CASCADE" });
Ride.belongsTo(Group, { foreignKey: "groupId" });

GroupMember.belongsTo(Group, { foreignKey: "groupId" });

// A User can create many Rides
User.hasMany(Ride, { foreignKey: "createdBy", onDelete: "CASCADE" });
Ride.belongsTo(User, { foreignKey: "createdBy" });

// A User can be a road captain for many Rides
User.hasMany(Ride, { foreignKey: "roadCaptain", onDelete: "CASCADE" });
Ride.belongsTo(User, { foreignKey: "roadCaptain" });

// A ride has many ride stops
RideStop.belongsTo(Ride, { foreignKey: "rideId", as: "ride" });
RideStop.belongsTo(User, { foreignKey: "userId", as: "user" });
Ride.hasMany(RideStop, { foreignKey: "rideId", as: "stops" });
import { User } from "./User";
import { Bike } from "./Bike";
import { Group } from "./Group";
import { GroupMember } from "./GroupMembers";
import { Ride } from "./Ride";
import { RideStop } from "./RideStop";
import { GroupInvitation } from "./GroupInvitation";
import { Sos } from "./Sos";

// User associations
User.hasMany(Bike, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Group, { foreignKey: "createdBy", onDelete: "CASCADE" });
User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId", onDelete: "CASCADE"});
User.hasMany(Ride, { foreignKey: "createdBy", onDelete: "CASCADE" });
User.hasMany(Ride, { foreignKey: "roadCaptainId", onDelete: "CASCADE" });
User.belongsToMany(Ride, { through: "ride_participants", foreignKey: "userId", as: "trips" });
User.hasOne(Sos, { foreignKey: "userId", as: "sos", onDelete: "CASCADE" });

// // Bike associations
Bike.belongsTo(User, { foreignKey: "userId", as: "owner" });

// // Group associations
Group.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Group.belongsToMany(User, { through: GroupMember, foreignKey: "groupId", as: "users", onDelete: "CASCADE" });
Group.hasMany(Ride, { foreignKey: "groupId", onDelete: "CASCADE" });
Group.hasMany(GroupMember, { foreignKey: "groupId", onDelete: "CASCADE", as: "members" });
Group.hasMany(GroupInvitation, { foreignKey: "groupId", as: "invitations" });

// // Group member associations
GroupMember.belongsTo(Group, { foreignKey: "groupId", as: 'group' });

// // Ride associations
Ride.belongsTo(Group, { foreignKey: "groupId" });
Ride.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Ride.belongsTo(User, { foreignKey: "roadCaptainId", as: "roadCaptain" });
Ride.hasMany(RideStop, { foreignKey: "rideId", as: "stops" });
Ride.belongsToMany(User, { through: "ride_participants", foreignKey: "rideId", as: "participants" });

// Ride Stop Associations
RideStop.belongsTo(Ride, { foreignKey: "rideId", as: "ride" });
RideStop.belongsTo(User, { foreignKey: "userId", as: "user" });

// Group Invitation
GroupInvitation.belongsTo(Group, { foreignKey: "groupId", as: "group" });
GroupInvitation.belongsTo(User, { as: "sender", foreignKey: "senderId" });

// SOS association
Sos.belongsTo(User, { foreignKey: "userId", as: "user" });
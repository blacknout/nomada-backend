import { User } from "./User";
import { Bike } from "./Bike";
import { Group } from "./Group";
import { GroupMember } from "./GroupMembers";
import { Ride } from "./Ride";
import { RideStop } from "./RideStop";
import { Sos } from "./Sos";
import { Notification } from "./Notification";

// User associations
User.hasMany(Bike, { foreignKey: "userId", onDelete: "CASCADE" });
User.hasMany(Group, { foreignKey: "createdBy", onDelete: "CASCADE" });
User.belongsToMany(Group, { through: GroupMember, foreignKey: "userId", onDelete: "CASCADE"});
User.belongsToMany(Group, {
  through: 'GroupAdmins',
  as: 'adminGroups',
  foreignKey: 'userId',
});
User.hasMany(Ride, { foreignKey: "createdBy", onDelete: "CASCADE" });
User.hasMany(Ride, { foreignKey: "roadCaptainId", onDelete: "CASCADE" });
User.belongsToMany(Ride, { 
  through: "ride_participants",
  foreignKey: "userId", 
  otherKey: "rideId",
  as: "trips" 
});
User.hasMany(Sos, { foreignKey: "userId", as: "sos", onDelete: "CASCADE" });
User.hasMany(Sos, { foreignKey: 'contactId', as: 'contact' });

// // Bike associations
Bike.belongsTo(User, { foreignKey: "userId", as: "owner" });

// // Group associations
Group.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Group.belongsToMany(User, 
  { through: GroupMember, 
    foreignKey: "groupId", 
    as: "users", 
    onDelete: "CASCADE"
  }
);
Group.belongsToMany(User, {
  through: 'GroupAdmins',
  as: 'groupAdmins',
  foreignKey: 'groupId',
});
Group.hasMany(Ride, {
  foreignKey: "groupId", 
  onDelete: "CASCADE" 
});
Group.hasMany(GroupMember, 
  { foreignKey: "groupId", 
    onDelete: "CASCADE", 
    as: "members" 
  });

// Group member associations
GroupMember.belongsTo(Group, { foreignKey: "groupId", as: 'group' });
GroupMember.belongsTo(User, { foreignKey: "userId", as: 'user' });

// Ride associations
Ride.belongsTo(Group, { foreignKey: "groupId", as: 'rideGroup' });
Ride.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
Ride.belongsTo(User, { foreignKey: "roadCaptainId", as: "roadCaptain" });
Ride.hasMany(RideStop, { foreignKey: "rideId", as: "stops" });
Ride.belongsToMany(User, { 
  through: "ride_participants", 
  foreignKey: "rideId", 
  otherKey: "userId",
  as: "participants" 
});

// Ride Stop Associations
RideStop.belongsTo(Ride, { foreignKey: "rideId", as: "ride" });
RideStop.belongsTo(User, { foreignKey: "userId", as: "user" });

// SOS association
Sos.belongsTo(User, { foreignKey: "userId", as: "user" });
Sos.belongsTo(User, { foreignKey: "contactId", as: "contact" });

// Notification association
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Bike,
  Group,
  GroupMember,
  Notification,
  Sos,
  Ride,
  RideStop
}
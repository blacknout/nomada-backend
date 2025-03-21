"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
const Bike_1 = require("./Bike");
const Group_1 = require("./Group");
const GroupMembers_1 = require("./GroupMembers");
const Ride_1 = require("./Ride");
const RideStop_1 = require("./RideStop");
// A User owns many Bikes
User_1.User.hasMany(Bike_1.Bike, { foreignKey: "userId", onDelete: "CASCADE" });
Bike_1.Bike.belongsTo(User_1.User, { foreignKey: "userId" });
// A User can create many Groups
User_1.User.hasMany(Group_1.Group, { foreignKey: "createdBy", onDelete: "CASCADE" });
Group_1.Group.belongsTo(User_1.User, { foreignKey: "createdBy" });
// A User can be in many Groups (through GroupMember)
User_1.User.belongsToMany(Group_1.Group, { through: GroupMembers_1.GroupMember, foreignKey: "userId" });
Group_1.Group.belongsToMany(User_1.User, { through: GroupMembers_1.GroupMember, foreignKey: "groupId", as: "users" });
// A Group has many Rides
Group_1.Group.hasMany(Ride_1.Ride, { foreignKey: "groupId", onDelete: "CASCADE" });
Ride_1.Ride.belongsTo(Group_1.Group, { foreignKey: "groupId" });
// A User can create many Rides
User_1.User.hasMany(Ride_1.Ride, { foreignKey: "createdBy", onDelete: "CASCADE" });
Ride_1.Ride.belongsTo(User_1.User, { foreignKey: "createdBy" });
// A User can be a road captain for many Rides
User_1.User.hasMany(Ride_1.Ride, { foreignKey: "roadCaptain", onDelete: "CASCADE" });
Ride_1.Ride.belongsTo(User_1.User, { foreignKey: "roadCaptain" });
// A ride has many ride stops
RideStop_1.RideStop.belongsTo(Ride_1.Ride, { foreignKey: "rideId", as: "ride" });
RideStop_1.RideStop.belongsTo(User_1.User, { foreignKey: "userId", as: "user" });
Ride_1.Ride.hasMany(RideStop_1.RideStop, { foreignKey: "rideId", as: "stops" });

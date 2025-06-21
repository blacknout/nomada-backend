import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { WEEK_TOKEN_EXPIRATION } from "../utils/constants/constants";
import {
  User,
  Bike,
  Group,
  GroupMember,
  Notification,
  Sos,
  Ride,
  RideStop,
} from "../models/associations";
// import User from '../models/User';
// import Bike from '../models/Bike';
// import {Ride} from '../models/Ride';
// import Group from '../models/Group';
// import GroupMember from '../models/GroupMembers';
// import RideStop from '../models/RideStop';
// import Sos from '../models/Sos';
// import Notification from '../models/Notification';
import { Location } from "../@types/location";

async function seedDatabase() {
  console.log("🌱 Seeding data if not exists...");

  const [alice] = await User.findOrCreate({
    where: { email: "alice@test.com" },
    defaults: {
      username: "Alice101",
      password: "Password1",
      firstname: "Alice",
      lastname: "Walker",
      state: "Lagos",
      country: "Nigeria",
      phone: "+234820332322",
    },
  });

  const token = jwt.sign({ alice }, process.env.JWT_SECRET as string, {
    expiresIn: WEEK_TOKEN_EXPIRATION,
  });

  alice.update({
    isVerified: true,
    token,
  });

  const [user1] = await User.findOrCreate({
    where: { email: "john@example.com" },
    defaults: {
      username: "John.Doe",
      password: "hashedpassword",
      firstname: "John",
      lastname: "Doe",
      state: "Lagos",
      country: "Nigeria",
      phone: "+2348245356556",
      isVerified: true,
    },
  });

  user1.update({
    isVerified: true,
  });

  const [user2] = await User.findOrCreate({
    where: { email: "jane@example.com" },
    defaults: {
      username: "Jane Smith",
      password: "hashedpassword",
      firstname: "Jane",
      lastname: "Doe",
      state: "Lagos",
      country: "Nigeria",
      phone: "+234826234232",
      isVerified: true,
    },
  });

  const [user3] = await User.findOrCreate({
    where: { email: "rider1@example.com" },
    defaults: {
      username: "rider1",
      email: "rider1@example.com",
      password: "password",
      firstname: "John",
      lastname: "Doe",
      state: "Lagos",
      country: "Nigeria",
      isAdmin: false,
      isVerified: true,
      isDisabled: false,
    },
  });

  const [user4] = await User.findOrCreate({
    where: { email: "rider2@example.com" },
    defaults: {
      username: "rider2",
      email: "rider2@example.com",
      password: "password",
      firstname: "Jane",
      lastname: "Smith",
      state: "Abuja",
      country: "Nigeria",
      isAdmin: false,
      isVerified: true,
      isDisabled: false,
    },
  });

  await Bike.findOrCreate({
    where: { userId: alice.id },
    defaults: {
      model: "GS 1250",
      color: "White",
      plate: "Papa D",
      make: "BMW",
      year: "2024",
    },
  });
  await Bike.findOrCreate({
    where: { userId: user1.id },
    defaults: {
      model: "R1",
      color: "Black",
      plate: "rt 23 dfd",
      make: "Yamaha",
      year: "2022",
      vin: "1HGCM8263GA04223",
    },
  });

  await Bike.findOrCreate({
    where: { userId: user2.id },
    defaults: {
      model: "Panigale",
      color: "Red",
      plate: "rt 55 aaa",
      make: "Ducati",
      year: "2021",
      vin: "1HGCM82632A59687",
    },
  });

  await Bike.create({
    id: uuidv4(),
    userId: user3.id,
    make: "Honda",
    model: "CBR",
    year: "2021",
    color: "red",
    stolen: false,
    notInUse: false,
    vin: "1HGCM82638A68473",
  });

  await Bike.create({
    id: uuidv4(),
    userId: user4.id,
    make: "Yamaha",
    model: "R1",
    year: "2020",
    color: "blue",
    stolen: false,
    notInUse: false,
    vin: "1HGCM8263MA22345",
  });

  const [group1] = await Group.findOrCreate({
    where: { name: "Nomada Riders" },
    defaults: {
      description: "A group of passionate riders.",
      createdBy: user1.id,
    },
  });

  const [group2] = await Group.findOrCreate({
    where: { name: "Lagos Riders" },
    defaults: {
      description: "Weekend rides around Lagos",
      isPrivate: false,
      isRestricted: false,
      createdBy: user1.id,
    },
  });

  await GroupMember.findOrCreate({
    where: { userId: user1.id, groupId: group1.id },
    defaults: {},
  });

  await GroupMember.findOrCreate({
    where: { userId: user1.id, groupId: group2.id },
    defaults: {},
  });

  await GroupMember.findOrCreate({
    where: { userId: user2.id, groupId: group1.id },
    defaults: {},
  });

  await GroupMember.bulkCreate([
    {
      id: uuidv4(),
      userId: user3.id,
      groupId: group2.id,
      type: "active",
    },
    {
      id: uuidv4(),
      userId: user4.id,
      groupId: group2.id,
      type: "active",
    },
  ]);

  const route: Location[] = [
    { latitude: 6.5244, longitude: 3.3792, address: null },
    { latitude: 6.535, longitude: 3.3932 },
    { latitude: 6.545, longitude: 3.4032 },
  ];

  const ride = await Ride.create({
    id: uuidv4(),
    name: "Lekki Sunday Ride",
    groupId: group2.id,
    createdBy: user1.id,
    roadCaptainId: user2.id,
    route,
    startLocation: route[0],
    destination: route[2],
    status: "completed",
  });

  await (ride as any).addParticipant(user1);
  await (ride as any).addParticipant(user2);

  await RideStop.create({
    id: uuidv4(),
    rideId: ride.id,
    userId: user1.id,
    reason: "mechanical",
    location: { latitude: 6.535, longitude: 3.3932 },
    isResolved: true,
  });

  await Sos.create({
    id: uuidv4(),
    userId: user1.id,
    contactId: user2.id,
    isActivated: true,
    contactName: "Jane Emergency",
    email: "emergency@example.com",
    phone: "+234123456789",
  });

  await Notification.create({
    id: uuidv4(),
    userId: user2.id,
    type: "sos",
    title: "SOS Alert Sent",
    message: "You triggered an SOS alert during the ride.",
    read: false,
    priority: "high",
  });

  console.log("Seed completed ✅");
}

seedDatabase().catch((error) => {
  console.error("Seeding error:", error);
});

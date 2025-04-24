import jwt from "jsonwebtoken";
import { WEEK_TOKEN_EXPIRATION } from "../utils/constants/constants";
import { User } from '../models/User';
import { Bike } from '../models/Bike';
import { Group } from '../models/Group';
import { GroupMember } from '../models/GroupMembers';

async function seedDatabase() {
  console.log('🌱 Seeding data if not exists...');

  const [alice] = await User.findOrCreate({
    where: { email: 'alice@test.com' },
    defaults: { username: 'Alice101', password: "Password1",
      firstname: "Alice", lastname: "Walker", state: "Lagos",
      country: "Nigeria", phone: "+234820332322"
      }
  });

  const token = jwt.sign(
    { alice },
    process.env.JWT_SECRET as string,
    { expiresIn: WEEK_TOKEN_EXPIRATION }
  );

  alice.update({
    isVerified: true,
    token
  });

  const [user1] = await User.findOrCreate({
    where: { email: 'john@example.com' },
    defaults: {
      username: 'John.Doe',
      password: 'hashedpassword',
      firstname: "John", lastname: "Doe", state: "Lagos",
      country: "Nigeria", phone: "+2348245356556"
    },
  });

  const [user2] = await User.findOrCreate({
    where: { email: 'jane@example.com' },
    defaults: {
      username: 'Jane Smith',
      password: 'hashedpassword',
      firstname: "Jane", lastname: "Doe", state: "Lagos",
      country: "Nigeria", phone: "+234826234232"
    },
  });

  await Bike.findOrCreate({
    where: { userId: alice.id },
    defaults: {
      model: 'GS 1250',
      color: 'White',
      plate: "Papa D",
      make: "BMW",
      year: "2024",
    },
  });
  await Bike.findOrCreate({
    where: { userId: user1.id },
    defaults: {
      model: 'R1',
      color: 'Black',
      plate: "rt 23 dfd",
      make: "Yamaha",
      year: "2022",
    },
  });

  await Bike.findOrCreate({
    where: { userId: user2.id },
    defaults: {
      model: 'Panigale',
      color: 'Red',
      plate: "rt 55 aaa",
      make: "Ducati",
      year: "2021",
    },
  });

  const [group] = await Group.findOrCreate({
    where: { name: 'Nomada Riders' },
    defaults: {
      description: 'A group of passionate riders.',
      createdBy: user1.id,
    },
  });

  await GroupMember.findOrCreate({
    where: { userId: user1.id, groupId: group.id },
    defaults: {},
  });

  await GroupMember.findOrCreate({
    where: { userId: user2.id, groupId: group.id },
    defaults: {},
  });

  console.log('Seed completed ✅');
}

seedDatabase().catch((error) => {
  console.error('Seeding error:', error);
});

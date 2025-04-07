import request from "supertest";
import { faker } from '@faker-js/faker';
import { Op } from "sequelize";
import app from "../../src/app";
import jest from "jest";
import "../../src/models/associations";
import Bike from "../../src/models/Bike";
import User from "../../src/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { 
  WEEK_TOKEN_EXPIRATION 
} from "../../src/utils/constants";


let testUser: any;
let testPassword = faker.internet.password();
let testEmail = faker.internet.email();
let testUsername = faker.internet.displayName()

beforeAll(async () => {
  testUser = await User.create({
    username: testUsername,
    email: testEmail,
    password: testPassword,
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    state: faker.location.city(),
    country: faker.location.country(),
    phone: faker.phone.number()
  } as any);

  const token = jwt.sign(
    {
      id: testUser.id,
      username: testUser.username,
      firstname: testUser.firstname,
      email: testUser.email,
      lastname: testUser.lastname,
      isAdmin: testUser.isAdmin,
      country: testUser.country,
      state: testUser.state,
      phone: testUser.phone,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: WEEK_TOKEN_EXPIRATION }
  );

  testUser.update({
    isVerified: true,
    token
  } as any);
});

describe("POST api/bike/", () => {
  it("should create a new bike", async () => {
    const res = await request(app).post("/api/bike/")
    .set("Authorization", `Bearer ${testUser.token}`)
    .send({
      plate: faker.vehicle.vrm(),
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past(),
      vin: faker.vehicle.vin(),
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Bike created successfully.");
  });
  it("should fail to create a new bike due to bad inputs", async () => {
    const res = await request(app).post("/api/bike/")
    .set("Authorization", `Bearer ${testUser.token}`)
    .send({
      plate: "dd",
      make: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.date.past(),
      vin: faker.vehicle.vin(),
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("Plate number must be at least 3 characters.");
  });
  it("should fail to create a new bike due missing inputs", async () => {
    const res = await request(app).post("/api/bike/")
    .set("Authorization", `Bearer ${testUser.token}`)
    .send({
      plate: faker.vehicle.vrm(),
      model: faker.vehicle.model(),
      year: faker.date.past(),
      vin: faker.vehicle.vin(),
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("The make must be at least 3 characters.");
  });
});
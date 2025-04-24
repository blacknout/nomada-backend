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
} from "../../src/utils/constants/constants";


let testUser: any;
let newBike: any;

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

  newBike = await Bike.create({
    plate: faker.vehicle.vrm(),
    make: faker.vehicle.manufacturer(),
    model: faker.vehicle.model(),
    year: faker.date.past(),
    vin: faker.vehicle.vin(),
    userId: testUser.id,
    notInUse: false
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

describe("GET api/bike/:id", () => {
  it("should get a bike", async () => {
    const res = await request(app).get(`/api/bike/${newBike.id}`)
    .set("Authorization", `Bearer ${testUser.token}`)

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bike");
    expect(res.body.bike.plate).toBe(newBike.plate);
  });
  it("should not get a bike due to wrong id", async () => {
    const res = await request(app).get(`/api/bike/${faker.string.uuid()}`)
    .set("Authorization", `Bearer ${testUser.token}`)

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Bike not found");
  });
  it("should not get a bike due to wrong id", async () => {
    const res = await request(app).get('/api/bike/randomId')
    .set("Authorization", `Bearer ${testUser.token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("Bike ID must be a valid UUID");
  });
});

describe("PUT api/bike/:id", () => {
  it("should update a bike plate number", async () => {
    const plate = faker.vehicle.vrm()
    const res = await request(app).put(`/api/bike/${newBike.id}`)
    .set("Authorization", `Bearer ${testUser.token}`)
    .send({
      plate,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bike");
    expect(res.body.bike.plate).toBe(plate);
  });
  it("should update a bike's make", async () => {
    const make = faker.vehicle.model();
    const res = await request(app).put(`/api/bike/${newBike.id}`)
    .set("Authorization", `Bearer ${testUser.token}`)
    .send({
      make,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bike");
    expect(res.body.bike.make).toBe(make);
  });
  it("should not update a bike due to bad inputs for model", async () => {
    const res = await request(app).get('/api/bike/randomId')
    .set("Authorization", `Bearer ${testUser.token}`)
    .send({
      model: "e"
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("The model name must be at least 2 characters.");
  });
  it("should not update a bike due to wrong id", async () => {
    const res = await request(app).put("/api/bike/randomidhere")
    .set("Authorization", `Bearer ${testUser.token}`)
    .send({
      model: faker.vehicle.model(),
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("The model name must be at least 2 characters.");
  });
});

describe("GET api/bike/:id", () => {
  it("should get a bike", async () => {
    const res = await request(app).get(`/api/bike/${newBike.id}`)
    .set("Authorization", `Bearer ${testUser.token}`)

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("bike");
    expect(res.body.bike.plate).toBe(newBike.plate);
  });
  it("should not get a bike due to wrong id", async () => {
    const res = await request(app).get(`/api/bike/${faker.string.uuid()}`)
    .set("Authorization", `Bearer ${testUser.token}`)

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Bike not found");
  });
  it("should not get a bike due to wrong id", async () => {
    const res = await request(app).get('/api/bike/randomId')
    .set("Authorization", `Bearer ${testUser.token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("Bike ID must be a valid UUID");
  });
});

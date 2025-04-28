import request from "supertest";
import { faker } from '@faker-js/faker';
import { Op } from "sequelize";
import app from "../../src/app";
import jest from "jest";
import "../../src/models/associations";
import User from "../../src/models/User";
import jwt from "jsonwebtoken";
import { 
  EXPIRES_IN_FIFTEEN_OTP, 
  WEEK_TOKEN_EXPIRATION 
} from "../../src/utils/constants/constants";

let testUser: any;
let testUser2: any;
let testPassword = faker.internet.password();
let testEmail = faker.internet.email();
let testUsername = faker.internet.displayName();

beforeAll(async () => {
  const createTestUser = async (email: string, password: string, username: string) => {
    return await User.create({
      username: username || faker.internet.displayName(),
      email: email || faker.internet.email(),
      password: password || faker.internet.password(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number()
    } as any);
  };
  testUser = await createTestUser(testEmail, testPassword, testUsername);
  testUser2 = await createTestUser("", "", "");

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

  const token2 = jwt.sign(
    {
      id: testUser2.id,
      username: testUser2.username,
      firstname: testUser2.firstname,
      email: testUser2.email,
      lastname: testUser2.lastname,
      isAdmin: testUser2.isAdmin,
      country: testUser2.country,
      state: testUser2.state,
      phone: testUser2.phone,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: WEEK_TOKEN_EXPIRATION }
  );

  testUser2.update({
    isVerified: true,
    token: token2
  } as any);
});

const getloggedInUser = async () => {
  return  await User.findOne({
    where: {
      ['token']: {
        [Op.ne]: null,
      },
    } as any,
  });
}

let generatedEmail1 = faker.internet.email();
let generatedPassword1 = faker.internet.password();

describe("POST api/user/register", () => {
  let email: string;
  it("should register a user", async () => {
    const res = await request(app).post("/api/user/register").send({
      username: faker.internet.displayName(),
      email: generatedEmail1,
      password: generatedPassword1,
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number()
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("OTP sent successfully");
  });
  it("should only send OTP since the email is the same", async () => {
    const res = await request(app).post("/api/user/register").send({
      username: faker.internet.displayName(),
      email: generatedEmail1,
      password: generatedPassword1,
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number()
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("OTP sent successfully");
  });

  it("should fail to register user due to bad request entries", async () => {
    const res = await request(app).post("/api/user/register").send({
      username: "e",
      email: "testexample.",
      password: "kjkk",
      firstname: "Sadatt",
      lastname: "Baraka",
      state: "Lagos",
      country: "Nigeria",
      phone: 3232323233
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("Username must be at least 3 characters.");
    expect(res.body.errors[1].msg).toBe("Invalid email format.");
    expect(res.body.errors[2].msg).toBe("Password must be at least 6 characters.");
    expect(res.body.errors[3].msg).toBe("Password must contain at least one number");
    expect(res.body.errors[4].msg).toBe("Password must contain at least one uppercase letter");
  });
  it("should fail due to email already being verified", async () => {
    let newEmail = faker.internet.email();

    const firstResponse = await request(app)
    .post("/api/user/register")
    .send({
      email: newEmail,
      username: faker.internet.displayName(),
      password: faker.internet.password(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number()
    });

  expect(firstResponse.status).toBe(201);
  expect(firstResponse.body).toHaveProperty("message");
  expect(firstResponse.body.message).toBe("OTP sent successfully");

  // Second registration with same email should fail
  const secondResponse = await request(app)
  .post("/api/user/register")
  .send({
    email: newEmail,
    username: faker.internet.displayName(),
    password: faker.internet.password(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    state: faker.location.city(),
    country: faker.location.country(),
    phone: faker.phone.number()
  });

  expect(secondResponse.status).toBe(200);
  expect(secondResponse.body).toHaveProperty("message");
  expect(secondResponse.body.message).toBe("OTP sent successfully");

  // Verify the user
  const user = await User.findOne({ where: { email: newEmail }});
  if (user) {
    await user.update({
      isVerified: true,
    });
  }

  const thirdResponse = await request(app)
    .post("/api/user/register")
    .send({
      email: newEmail,
      username: faker.internet.displayName(),
      password: faker.internet.password(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number()
    });
    expect(thirdResponse.status).toBe(400);
    expect(thirdResponse.body).toHaveProperty("message");
    expect(thirdResponse.body.message).toBe("Email already exists");
  });
});

describe("POST api/user/login", () => {
  it("should not log in a non verified user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: generatedEmail1,
      password: generatedPassword1,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("This user has not verified the account.");
  });

  it("should not log in a user due to wrong email", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: "test123dsdsds@example.com",
      password: generatedPassword1,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid credentials");
  });
  it("should not log in a user due to password mismatch", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: generatedEmail1,
      password: "Testpassword1dde3",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid credentials");
  });
  it("should log in a user", async () => {
    const res = await request(app).post("/api/user/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.message).toBe("This user has been logged in");
  });
})

describe("POST api/user/verify-otp", () => {
  it("should not verify a bad otp ", async () => {
    const res = await request(app).post("/api/user/verify-otp").send({
      email: "test2@example.com",
      otp: "randomotp",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid OTP");
  });
  it("should not verify a non existent email", async () => {
    const res = await request(app).post("/api/user/verify-otp").send({
      email: "testnouser@example.com",
      otp: faker.number.int({ min: 100000, max: 999999 })
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Invalid OTP");
  });
  it("should not verify an expired otp", async () => {
    const email = "test2@example.com";
    const sixteenMinutesAgo = new Date(Date.now() - 16 * 60 * 1000);
    const otp = faker.number.int({ min: 100000, max: 999999 });
    await User.create({
      email,
      username: faker.internet.displayName(),
      password: faker.internet.password(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number(),
      otp,
      otpExpires: sixteenMinutesAgo
    } as any);

    const res = await request(app).post("/api/user/verify-otp").send({
      email,
      otp
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("OTP expired");
  });
  it("should verify the otp", async () => {
    const email = faker.internet.email();
    const otp = faker.number.int({ min: 100000, max: 999999 });
    const currentTime = EXPIRES_IN_FIFTEEN_OTP;
    await User.create({
      username: faker.internet.displayName(),
      email,
      password: faker.internet.password(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number(),
      otp,
      otpExpires: currentTime
    } as any);
    
    const res = await request(app).post("/api/user/verify-otp").send({
      email,
      otp
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");
    expect(res.body.message).toBe("Email verified.");
  });
});

describe("GET api/user/:userId", () => {
  let token: string;
  it("should get user by userId", async () => {
    const email = faker.internet.email();
    const user = await User.create({
      username: faker.internet.displayName(),
      email,
      password: faker.internet.password(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
    } as any);
    token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        email: user.email,
        lastname: user.lastname,
        isAdmin: user.isAdmin,
        country: user.country,
        state: user.state,
        phone: user.phone,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: WEEK_TOKEN_EXPIRATION }
    );
    const userId = user.id;
    const res = await request(app).get(`/api/user/${userId}`)
    .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("user");
  });
  it("should fail due to bad uuid", async () => {

    const res = await request(app).get("/api/user/badUserId123")
    .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("User ID must be a valid UUID");

  });
  it("should get not get the user", async () => {

    const res = await request(app).get(`/api/user/${faker.string.uuid()}`)
    .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("User not found.");
  });
})

describe("GET api/user/?search=", () => {
  it("should fail to return by search term", async () => {
    const user = await User.findOne({ where: { email: testEmail }})
    const token = user?.token;
    const searchTerm = "randombunchofwordsthatdoesntexist";
    const res = await request(app).get(`/api/user/?search=${searchTerm}`)
    .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
    expect(res.body.results).toBe(null);
  })
  it("should fail due to empty input", async () => {
    const user = await User.findOne({ where: { email: testEmail }})
    const token = user?.token;
    const searchTerm = "";
    const res = await request(app).get(`/api/user/?search=${searchTerm}`)
    .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg)
    .toBe("Search can only contain letters, numbers, or hyphens(-)");
  })
  it("should fail to due bad input", async () => {
    const user = await User.findOne({ where: { email: testEmail }})
    const token = user?.token;
    const searchTerm = {};
    const res = await request(app).get(`/api/user/?search=${searchTerm}`)
    .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg)
    .toBe("Search can only contain letters, numbers, or hyphens(-)");
  })
  it("should return a match", async () => {
    const user = await User.findOne({ where: { email: testEmail }})
    const token = user?.token;
    const searchTerm = testUsername.slice(-testUsername.length, -(testUsername.length-2));
    const res = await request(app).get(`/api/user/?search=${searchTerm}`)
    .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("results");
  })
});

describe("PUT api/user/", () => {
  it("should fail to update a user due to non existent user", async () => {
    const token = testUser2.token;
    testUser2.destroy();
    const res = await request(app).put('/api/user/')
    .set("Authorization", `Bearer ${token}`)
    .send({
      username: faker.internet.displayName(),
      firstname: faker.person.firstName(),
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("The logged in user is not available.");
  });
  it("should fail due to bad input", async () => {
    const user1 = await User.findOne({ where: { email: testEmail }});
    const token = user1?.token;
    const res = await request(app).put('/api/user/')
    .set("Authorization", `Bearer ${token}`)
    .send({
      username: "f",
      firstname: "f",
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number(),
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe("Username must be at least 3 characters.");
  });
  it("should successfully update the user", async () => {
    const user1 = await User.findOne({ where: { email: testEmail }});
    const token = user1?.token;
    const userId = user1?.id;
    const res = await request(app).put('/api/user/')
    .set("Authorization", `Bearer ${token}`)
    .send({
      username: faker.internet.displayName(),
      firstname: faker.person.firstName(),
      email: testEmail,
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number(),
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("User updated successfully");
  });
  it("should  fail due to an unauthenticated user", async () => {
    const user1 = await User.findOne({ where: { email: testEmail }});
    const res = await request(app).put('/api/user/')
    .send({
      username: faker.internet.displayName(),
      firstname: faker.person.firstName(),
      email: testEmail,
      lastname: faker.person.lastName(),
      state: faker.location.city(),
      country: faker.location.country(),
      phone: faker.phone.number(),
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("Access Denied. No Token Provided.");
  });

});
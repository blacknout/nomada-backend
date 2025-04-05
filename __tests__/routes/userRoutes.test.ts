import request from "supertest";
import app from "../../src/app";
import jest from "jest";
import User from "../../src/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// jest.mock("../../src/models//User");
// jest.mock("jsonwebtoken");

describe("POST api/user/register", () => {
  it("should register a user", async () => {
    const res = await request(app).post("/api/user/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "Testpassword1",
      firstname: "Sadatt",
      lastname: "Baraka",
      state: "Lagos",
      country: "Nigeria",
      phone: 12332323333
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.username).toBe("testuser");
  });
});
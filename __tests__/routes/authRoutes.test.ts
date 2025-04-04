import request from "supertest";
import app from "../../src/app";
import db from "../../src/models";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("../../src/models");
jest.mock("jsonwebtoken");

describe("User Login API", () => {
  it("should authenticate a user and return a JWT token", async () => {
    const mockUser = {
      id: "123",
      username: "testuser",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
    };

    db.User.findOne.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue("mocked-jwt-token");

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});

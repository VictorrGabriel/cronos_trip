import request from "supertest";
import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { app } from "@/server";
import { prisma } from "@lib/prisma";
import {
  makeUserRecord,
  makeRefreshTokenRecord,
  makeAccessToken,
  checkAccessToken
} from "@/shared/factories";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { generateRefreshToken, verifyRefreshToken } from "@shared/utils";

jest.mock("@lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

jest.mock("argon2", () => ({
  __esModule: true,
  default: {
    verify: jest.fn(),
    hash: jest.fn().mockResolvedValue("hashed-token"),
  },
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Auth Routes Integration Tests", () => {
  const baseUrl = "/api/v1/auth";
  beforeAll(() => {
    process.env.JWT_ACCESS_KEY = "test-access-secret";
    process.env.JWT_REFRESH_KEY = "test-refresh-secret";
  });

  beforeEach(() => {
    mockReset(prismaMock);
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      return await callback(prismaMock);
    });
    prismaMock.refreshToken.findMany.mockResolvedValue([]);
    (jest.mocked(argon2.verify) as jest.Mock).mockResolvedValue(true);
    (jest.mocked(argon2.hash) as jest.Mock).mockResolvedValue("hashed-token");
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 200 with accessToken and set refreshToken cookie on valid login", async () => {
      const user = makeUserRecord({ passwordHash: "hashed-password" });
      const refreshTokenRecord = makeRefreshTokenRecord({ userId: user.id });

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.refreshToken.findMany.mockResolvedValue([]);
      prismaMock.refreshToken.create.mockResolvedValue(refreshTokenRecord);

      const loginPayload = {
        email: user.email,
        password: "validPassword123@",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginPayload);
      const cookies = response.get("Set-Cookie");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(cookies).toBeDefined();
      // @ts-ignore ignore because cookies is string[] | undefined and it is checked above that it is defined
      expect(cookies[0]).toContain("refreshToken");
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "invalid-email", password: "password123@" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid email format",
        code: "VALIDATION_ERROR",
      });
    });

    it("should return 400 for missing password", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Password must be a non-empty string",
        code: "VALIDATION_ERROR",
      });
    });

    it("should return 401 for user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "notfound@example.com", password: "ValidPassword123@" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    });

    it("should return 401 for incorrect password", async () => {
      const user = makeUserRecord();
      prismaMock.user.findUnique.mockResolvedValue(user);

      (jest.mocked(argon2.verify) as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: user.email, password: "WrongPassword123@" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    });
  });

  describe("GET /api/v1/auth/refresh/:userId", () => {
    it("should return 200 with accessToken on valid refresh token", async () => {
      const user = makeUserRecord();
      const refreshTokenRecord = makeRefreshTokenRecord({
        userId: user.id,
        tokenHash: "hashed-token",
      });

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.refreshToken.findFirst.mockResolvedValue(refreshTokenRecord);

      const validRefreshToken = generateRefreshToken(user.id.toString());

      const response = await request(app)
        .get(`${baseUrl}/refresh/${user.publicId}`)
        .set("Cookie", [`refreshToken=${validRefreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(checkAccessToken(response.body.accessToken)).toBeTruthy();
    });

    it("should return 400 for invalid userId", async () => {
      const response = await request(app)
        .get(`${baseUrl}/refresh/invalid-id`)
        .set("Cookie", ["refreshToken=token"]);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid id format",
        code: "INVALID_ID",
      });
    });

    it("should return 401 for missing refresh token", async () => {
      const user = makeUserRecord();

      prismaMock.user.findUnique.mockResolvedValue(user);

      const response = await request(app).get(
        `${baseUrl}/refresh/${user.publicId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Missing refresh token",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 401 for invalid refresh token", async () => {
      const user = makeUserRecord();
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.refreshToken.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/auth/refresh/${user.publicId}`)
        .set("Cookie", ["refreshToken=invalid-token"]);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Invalid Token: jwt malformed",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 401 for expired refresh token", async () => {
      const user = makeUserRecord();
      const expiredRefreshToken = jwt.sign(
        { userId: user.id.toString() },
        process.env.JWT_REFRESH_KEY as string,
        { expiresIn: "-1s" },
      );

      prismaMock.user.findUnique.mockResolvedValue(user);

      const response = await request(app)
        .get(`${baseUrl}/refresh/${user.publicId}`)
        .set("Cookie", [`refreshToken=${expiredRefreshToken}`]);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Token expired",
        code: "TOKEN_EXPIRED",  
      });
    });
  });

  describe("DELETE /api/v1/auth/logout/:userId", () => {
    it("should return 201 on successful logout", async () => {
      const user = makeUserRecord();
      const accessToken = makeAccessToken(user.id.toString());

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.refreshToken.findMany.mockResolvedValue([]);

      const response = await request(app)
        .delete(`${baseUrl}/logout/${user.publicId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "Logout successfully");
    });

    it("should return 400 for invalid userId", async () => {
      const accessToken = makeAccessToken("1");

      const response = await request(app)
        .delete(`${baseUrl}/logout/invalid-id`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid id format",
        code: "INVALID_ID",
      });
    });

    it("should return 401 for missing authorization header", async () => {
      const user = makeUserRecord();

      const response = await request(app).delete(
        `${baseUrl}/logout/${user.publicId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 401 for invalid access token", async () => {
      const user = makeUserRecord();

      const response = await request(app)
        .delete(`${baseUrl}/logout/${user.publicId}`)
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Invalid Token: jwt malformed",
        code: "INVALID_TOKEN",
      });
    });
  });

  describe("PATCH /api/v1/auth/user/password/:userId", () => {
    it("should return 201 on successful password update", async () => {
      const user = makeUserRecord({ passwordHash: "old-hashed-password" });
      const accessToken = makeAccessToken(user.id.toString());

      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.update.mockResolvedValue(user);

      const updatePayload = {
        currentPassword: "OldPassword123@",
        newPassword: "NewPassword123@",
      };

      const response = await request(app)
        .patch(`${baseUrl}/user/password/${user.publicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updatePayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Password updated successfully",
      );
    });

    it("should return 400 for invalid userId", async () => {
      const accessToken = makeAccessToken("1");

      const response = await request(app)
        .patch(`${baseUrl}/user/password/invalid-id`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ currentPassword: "pass", newPassword: "newpass" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid id format",
        code: "INVALID_ID",
      });
    });

    it("should return 400 for invalid password format", async () => {
      const user = makeUserRecord();
      const accessToken = makeAccessToken(user.id.toString());

      const response = await request(app)
        .patch(`${baseUrl}/user/password/${user.publicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ currentPassword: "short", newPassword: "short" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: expect.stringContaining(
          "password must be between 8 and 32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
        ),
        code: "VALIDATION_ERROR",
      });
    });

    it("should return 401 for missing authorization", async () => {
      const user = makeUserRecord();

      const response = await request(app)
        .patch(`${baseUrl}/user/password/${user.publicId}`)
        .send({ currentPassword: "pass", newPassword: "newpass" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 401 for invalid access token", async () => {
      const user = makeUserRecord();

      const response = await request(app)
        .patch(`${baseUrl}/user/password/${user.publicId}`)
        .set("Authorization", "Bearer invalid")
        .send({ currentPassword: "pass", newPassword: "newpass" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Invalid Token: jwt malformed",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 400 for missing fields", async () => {
      const user = makeUserRecord();
      const accessToken = makeAccessToken(user.id.toString());

      const response = await request(app)
        .patch(`${baseUrl}/user/password/${user.publicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ currentPassword: "pass" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "New password must be a non-empty string",
        code: "VALIDATION_ERROR",
      });
    });
  });
});

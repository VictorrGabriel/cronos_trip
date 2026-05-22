import { jest } from "@jest/globals";
import request from "supertest";
import { mockDeep, mockReset } from "jest-mock-extended";
import type { DeepMockProxy } from "jest-mock-extended";
import { Prisma, type PrismaClient } from "@prisma/client";

jest.mock("@lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { app } from "@/server";
import { prisma } from "@lib/prisma";
import { makeUserRecord, makeAccessToken } from "@shared/factories";
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("User routes", () => {
  const baseUrl = "/api/v1/users";

  beforeAll(() => {
    process.env.JWT_ACCESS_KEY = "test-access-secret";
    process.env.JWT_REFRESH_KEY = "test-refresh-secret";
  });

  afterAll(() => {
    delete process.env.JWT_ACCESS_KEY;
    delete process.env.JWT_REFRESH_KEY;
  });

  afterEach(() => {
    mockReset(prismaMock);
  });
  const prismaNotFoundError = new Prisma.PrismaClientKnownRequestError(
    "An operation failed because it depends on one or more records that were required but not found.",
    {
      code: "P2025",
      clientVersion: "5.0.0",
      meta: { cause: "Record to delete does not exist." },
    },
  );
  describe("GET /api/v1/users", () => {
    it("should respond with a list of users", async () => {
      const adminUser = makeUserRecord({
        role: "ADMIN",
      });
      const users = [
        makeUserRecord({ publicId: "alice#0000000001", name: "Alice" }),
        makeUserRecord({ publicId: "bob#0000000002", name: "Bob" }),
        adminUser,
      ];
      const accessToken = makeAccessToken(adminUser.publicId, adminUser.role);

      prismaMock.user.findMany.mockResolvedValue(users);

      const response = await request(app)
        .get(baseUrl)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "alice#0000000001",
            name: "Alice",
            email: "john.doe@example.com",
            role: "USER",
          }),
          expect.objectContaining({
            id: "bob#0000000002",
            name: "Bob",
            email: "john.doe@example.com",
            role: "USER",
          }),
          {
            id: adminUser.publicId,
            name: adminUser.name,
            email: adminUser.email,
            createdAt: adminUser.createdAt.toISOString(),
            role: adminUser.role,
          },
        ]),
      );
    });

    it("should return 403 for forbidden access", async () => {
      const user = makeUserRecord();
      const accessToken = makeAccessToken(user.publicId);

      const response = await request(app)
        .get(baseUrl)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body).toEqual({
        message: "Access denied",
        code: "AUTHORIZATION_ERROR",
      });
    });
  });

  describe("POST /api/v1/users", () => {
    it("should create a new user when payload is valid", async () => {
      const payload = {
        name: "Jane Doe",
        email: "jane.doe@example.com",
        password: "StrongPass1@",
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(
        makeUserRecord({
          publicId: "jane-doe#1234567890",
          name: payload.name,
          email: payload.email,
        }),
      );

      const response = await request(app)
        .post(baseUrl)
        .send(payload)
        .set("Content-Type", "application/json")
        .expect(200);

      expect(response.body).toMatchObject({
        id: "jane-doe#1234567890",
        name: payload.name,
        email: payload.email,
      });
      expect(new Date(response.body.createdAt).getTime()).not.toBeNaN();
      expect(response.body).not.toHaveProperty("role");
      expect(response.body).not.toHaveProperty("passwordHash");
    });

    it("should return 400 when email format is invalid", async () => {
      const payload = {
        name: "Jane Doe",
        email: "invalid-email",
        password: "StrongPass1@",
      };

      const response = await request(app)
        .post(baseUrl)
        .send(payload)
        .set("Content-Type", "application/json")
        .expect(400);

      expect(response.body).toEqual({
        message: "invalid email format",
        code: "VALIDATION_ERROR",
      });
    });

    it("should return 409 when email already exists", async () => {
      const payload = {
        name: "Jane Doe",
        email: "jane.doe@example.com",
        password: "StrongPass1@",
      };

      prismaMock.user.findUnique.mockResolvedValue(makeUserRecord());

      const response = await request(app)
        .post(baseUrl)
        .send(payload)
        .set("Content-Type", "application/json")
        .expect(409);

      expect(response.body).toEqual({
        message: "Email already exists",
        code: "EMAIL_CONFLICT",
      });
    });
  });

  describe("GET /api/v1/users/:id", () => {
    const userId = "charlie#0000000003";

    it("should require authorization header", async () => {
      const response = await request(app)
        .get(`${baseUrl}/${encodeURIComponent(userId)}`)
        .expect(401);

      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return user data when authorized and user exists", async () => {
      const accessToken = makeAccessToken(userId);
      prismaMock.user.findUnique.mockResolvedValue(
        makeUserRecord({
          publicId: userId,
          name: "Charlie",
          email: "charlie@example.com",
        }),
      );

      const response = await request(app)
        .get(`${baseUrl}/${encodeURIComponent(userId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        name: "Charlie",
        email: "charlie@example.com",
      });
    });

    it("should return 404 when user is not found", async () => {
      const accessToken = makeAccessToken(userId);
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/${encodeURIComponent(userId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toEqual({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    });

    it("should return 400 when id param is invalid", async () => {
      const invalidId = "abc";
      const accessToken = makeAccessToken(userId);

      const response = await request(app)
        .get(`${baseUrl}/${encodeURIComponent(invalidId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toEqual({
        message: "Invalid id format",
        code: "INVALID_ID",
      });
    });
  });

  describe("PATCH /api/v1/users/:id", () => {
    const userId = "delta#0000000004";

    it("should update a user when payload is valid", async () => {
      const accessToken = makeAccessToken(userId);
      prismaMock.user.update.mockResolvedValue(
        makeUserRecord({
          publicId: userId,
          name: "Delta Updated",
          email: "delta.updated@example.com",
        }),
      );

      const response = await request(app)
        .patch(`${baseUrl}/${encodeURIComponent(userId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: "Delta Updated" })
        .set("Content-Type", "application/json")
        .expect(201);

      expect(response.body).toEqual({
        message: "User updated successfully",
      });
    });

    it("should return 400 when update payload has no fields", async () => {
      const accessToken = makeAccessToken(userId);

      const response = await request(app)
        .patch(`${baseUrl}/${encodeURIComponent(userId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({})
        .set("Content-Type", "application/json")
        .expect(400);

      expect(response.body).toEqual({
        message: "At least one field must be provided for update",
        code: "VALIDATION_ERROR",
      });
    });

    it("should return 409 when update email already exists", async () => {
      const accessToken = makeAccessToken(userId);
      prismaMock.user.findUnique.mockResolvedValue(makeUserRecord());

      const response = await request(app)
        .patch(`${baseUrl}/${encodeURIComponent(userId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ email: "existing@example.com" })
        .set("Content-Type", "application/json")
        .expect(409);

      expect(response.body).toEqual({
        message: "Email already exists",
        code: "EMAIL_CONFLICT",
      });
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    const userId = "echo#0000000005";

    it("should delete a user when authorized", async () => {
      const accessToken = makeAccessToken(userId);
      prismaMock.user.delete.mockResolvedValue(
        makeUserRecord({ publicId: userId }),
      );

      const response = await request(app)
        .delete(`${baseUrl}/${encodeURIComponent(userId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toEqual({
        message: "User deleted successfully",
      });
    });

    it("should return 401 when authorization header is missing", async () => {
      const response = await request(app)
        .delete(`${baseUrl}/${encodeURIComponent(userId)}`)
        .expect(401);

      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 404 for non-existing user", async () => {
      const accessToken = makeAccessToken(userId);

      prismaMock.user.delete.mockRejectedValue(prismaNotFoundError);

      const response = await request(app)
        .delete(`${baseUrl}/${encodeURIComponent(userId)}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toEqual({
        message: "Record not found",
        code: "NOT_FOUND",
      });
    });
  });
});

import request from "supertest";
import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";
import { Prisma, PrismaClient } from "@prisma/client";
import { app } from "@/server";
import { prisma } from "@lib/prisma";
import {
  makeTripRecord,
  makeUserRecord,
  makeAccessToken,
} from "@/shared/factories";
import { pickByKeys } from "@/shared/utils";
import e from "express";

// Setup the deep mock for Prisma Client
jest.mock("@lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Trips Routes", () => {
  const validUserId = "user-1234567890";
  const validTripId = "trip-1234567890";
  const validAccessToken = makeAccessToken(validUserId);
  const mockUser = makeUserRecord({ publicId: validUserId });
  const mockTrip = makeTripRecord({
    publicId: validTripId,
    userId: mockUser.id,
  });
  const baseUrl = "/api/v1/trips";

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

  describe("GET /api/v1/trips/user/:userId", () => {
    it("should return 200 and list of trips for valid user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.trip.findMany.mockResolvedValue([mockTrip]);

      const response = await request(app)
        .get(`${baseUrl}/user/${validUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: mockTrip.publicId,
          userId: validUserId,
          name: mockTrip.name,
          startDate: mockTrip.startDate.toISOString(),
          endDate: mockTrip.endDate.toISOString(),
          status: mockTrip.status,
          budgetCents: mockTrip.budgetCents,
          createdAt: mockTrip.createdAt.toISOString(),
        },
      ]);
    });

    it("should return 401 when no authorization header", async () => {
      const response = await request(app).get(
        `${baseUrl}/user/${validUserId}`,
      );

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: "INVALID_TOKEN",
        message: "Missing or malformed authorization header",
      });
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get(`${baseUrl}/user/${validUserId}`)
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: "INVALID_TOKEN",
        message: "Invalid Token: jwt malformed",
      });
    });

    it("should return 400 for invalid userId format", async () => {
      const response = await request(app)
        .get(`${baseUrl}/user/short`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Invalid id format",
        code: "INVALID_ID",
      });
    });
  });

  describe("GET /api/v1/trips/:id", () => {
    it("should return 200 and trip details for valid id", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockTrip.publicId,
        userId: validUserId,
        name: mockTrip.name,
        startDate: mockTrip.startDate.toISOString(),
        endDate: mockTrip.endDate.toISOString(),
        status: mockTrip.status,
        budgetCents: mockTrip.budgetCents,
        createdAt: mockTrip.createdAt.toISOString(),
      });
    });

    it("should return 404 when trip not found", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "TRIP_NOT_FOUND",
        message: "Trip not found",
      });
    });

    it("should return 401 when no authorization", async () => {
      const response = await request(app).get(`${baseUrl}/${validTripId}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: "INVALID_TOKEN",
        message: "Missing or malformed authorization header",
      });
    });

    it("should return 400 for invalid id format", async () => {
      const response = await request(app)
        .get(`${baseUrl}/short`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });
  });

  describe("POST /api/v1/trips/:userId", () => {
    const validCreatePayload = {
      name: "New Trip",
      startDate: "2026-06-01",
      endDate: "2026-06-05",
      timezone: "America/New_York",
      status: "PLANNED",
      budgetCents: 5000,
    };

    it("should return 200 and created trip for valid data", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.trip.findMany.mockResolvedValue([]);
      prismaMock.trip.create.mockResolvedValue(mockTrip);

      const response = await request(app)
        .post(`${baseUrl}/${validUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validCreatePayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockTrip.publicId,
        userId: validUserId,
        name: mockTrip.name,
        startDate: mockTrip.startDate.toISOString(),
        endDate: mockTrip.endDate.toISOString(),
        status: mockTrip.status,
        budgetCents: mockTrip.budgetCents,
        createdAt: mockTrip.createdAt.toISOString(),
      });
    });

    it("should return 400 for invalid payload - name too short", async () => {
      const invalidPayload = { ...validCreatePayload, name: "A" };

      const response = await request(app)
        .post(`${baseUrl}/${validUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Name must have at least 3 characters",
      });
    });

    it("should return 400 for invalid payload - missing required field", async () => {
      const invalidPayload = pickByKeys({ ...validCreatePayload }, [
        "startDate",
        "endDate",
        "timezone",
        "status",
        "budgetCents",
      ]);

      const response = await request(app)
        .post(`${baseUrl}/${validUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Name must be a non-empty string",
      });
    });

    it("should return 404 when user not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post(`${baseUrl}/${validUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validCreatePayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    });

    it("should return 409 for conflicting dates", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.trip.findMany.mockResolvedValue([mockTrip]);

      const response = await request(app)
        .post(`${baseUrl}/${validUserId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validCreatePayload);

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        code: "TRIP_DATE_CONFLICT",
        conflict: [
          {
            endDate: expect.any(String),
            startDate: expect.any(String),
          },
        ],
        message: "Conflict dates",
      });
    });

    it("should return 401 when no authorization", async () => {
      const response = await request(app)
        .post(`${baseUrl}/${validUserId}`)
        .send(validCreatePayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: "INVALID_TOKEN",
        message: "Missing or malformed authorization header",
      });
    });
  });

  describe("PATCH /api/v1/trips/:id", () => {
    const validUpdatePayload = {
      name: "Updated Trip",
    };

    it("should return 201 for successful update", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.trip.update.mockResolvedValue(mockTrip);

      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validUpdatePayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "Trip updated successfully" });
    });

    it("should return 400 for invalid update payload - empty object", async () => {
      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "At least one field must be provided",
      });
    });

    it("should return 404 when trip not found", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validUpdatePayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "TRIP_NOT_FOUND",
        message: "Trip not found",
      });
    });

    it("should return 401 when no authorization", async () => {
      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}`)
        .send(validUpdatePayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });
  });

  describe("DELETE /api/v1/trips/:id", () => {
    it("should return 201 for successful deletion", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.trip.delete.mockResolvedValue(mockTrip);

      const response = await request(app)
        .delete(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "Trip deleted successfully" });
    });

    it("should return 404 when trip not found", async () => {
      prismaMock.trip.delete.mockRejectedValue(prismaNotFoundError);
      const invalidTripId = "trip-nonexistent";
      const response = await request(app)
        .delete(`${baseUrl}/${invalidTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "NOT_FOUND",
        message: "Record not found",
      });
    });

    it("should return 401 when no authorization", async () => {
      const response = await request(app).delete(`${baseUrl}/${validTripId}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: "INVALID_TOKEN",
        message: "Missing or malformed authorization header",
      });
    });
  });
});

import request from "supertest";
import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";
import { Prisma, PrismaClient } from "@prisma/client";
import { app } from "@/server";
import { prisma } from "@lib/prisma";
import {
  makeAccessToken,
  makeItineraryRecord,
  makeTripRecord,
  makeUserRecord,
} from "@/shared/factories";

jest.mock("@lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Itineraries Routes", () => {
  const validUserId = "user-1234567890";
  const validTripId = "trip-1234567890";
  const validItineraryId = "itinerary-1234567890";
  const validAccessToken = makeAccessToken(validUserId);
  const baseUrl = "/api/v1/itineraries";

  const mockUser = makeUserRecord({ publicId: validUserId });
  const mockTrip = makeTripRecord({ publicId: validTripId, userId: mockUser.id });
  const mockItinerary = makeItineraryRecord({
    publicId: validItineraryId,
    tripId: mockTrip.id,
    dayDate: new Date("2026-06-02"),
    notes: "Visit the museum",
    placeApiRef: "place1ref9",
    totalEstimateCents: 1500,
  });

  const prismaNotFoundError = new Prisma.PrismaClientKnownRequestError(
    "An operation failed because it depends on one or more records that were required but not found.",
    {
      code: "P2025",
      clientVersion: "5.0.0",
      meta: { cause: "Record to delete does not exist." },
    },
  );

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(async (callback) => callback(prismaMock));
  });

  afterEach(() => {
    mockReset(prismaMock);
  });

  describe("POST /api/v1/itineraries/:tripId", () => {
    const validPayload = {
      dayDate: "2026-06-02",
      dailyQuota: 2,
      totalEstimateCents: 1500,
      placeApiRef: "place1ref9",
      notes: "Visit the museum",
      status: "PLANNED",
    };

    it("should return 200 and created itinerary for valid payload", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.itinerary.findFirst.mockResolvedValue(null);
      prismaMock.itinerary.create.mockResolvedValue(mockItinerary);

      const response = await request(app)
        .post(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockItinerary.publicId,
        tripId: mockTrip.publicId,
        dayDate: mockItinerary.dayDate.toISOString(),
        dailyQuota: mockItinerary.dailyQuota,
        totalEstimateCents: mockItinerary.totalEstimateCents,
        placeApiRef: mockItinerary.placeApiRef,
        notes: mockItinerary.notes,
        status: mockItinerary.status,
        createdAt: mockItinerary.createdAt.toISOString(),
      });
    });

    it("should return 400 when payload is invalid", async () => {
      const response = await request(app)
        .post(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          ...validPayload,
          dailyQuota: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Daily quota must be greater or equal to 0",
      });
    });

    it("should return 404 when trip is not found", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validPayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "TRIP_NOT_FOUND",
        message: "Trip not found",
      });
    });

    it("should return 400 when trip date is outside range", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.itinerary.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post(`${baseUrl}/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          ...validPayload,
          dayDate: "2026-06-10",
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: "DAY_OUT_OF_RANGE_CONFLICT",
        message: "The Day is outside the range of trip days.",
      });
    });

    it("should return 401 when authorization header is missing", async () => {
      const response = await request(app)
        .post(`${baseUrl}/${validTripId}`)
        .send(validPayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        code: "INVALID_TOKEN",
        message: "Missing or malformed authorization header",
      });
    });

    it("should return 400 for invalid tripId format", async () => {
      const response = await request(app)
        .post(`${baseUrl}/short`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(validPayload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });
  });

  describe("GET /api/v1/itineraries/:id", () => {
    it("should return 200 and itinerary details when found", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);

      const response = await request(app)
        .get(`${baseUrl}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockItinerary.publicId,
        tripId: mockTrip.publicId,
        dayDate: mockItinerary.dayDate.toISOString(),
        dailyQuota: mockItinerary.dailyQuota,
        totalEstimateCents: mockItinerary.totalEstimateCents,
        placeApiRef: mockItinerary.placeApiRef,
        notes: mockItinerary.notes,
        status: mockItinerary.status,
        createdAt: mockItinerary.createdAt.toISOString(),
      });
    });

    it("should return 404 when itinerary is not found", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "ITINERARY_NOT_FOUND",
        message: "Itinerary not found",
      });
    });

    it("should return 404 when linked trip is missing", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.trip.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "TRIP_NOT_FOUND",
        message: "Trip not found",
      });
    });

    it("should return 400 for invalid itinerary id", async () => {
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

  describe("GET /api/v1/itineraries/trip/:tripId", () => {
    it("should return 200 and itinerary list for valid trip", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.itinerary.findMany.mockResolvedValue([mockItinerary]);

      const response = await request(app)
        .get(`${baseUrl}/trip/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: mockItinerary.publicId,
          tripId: mockTrip.publicId,
          dayDate: mockItinerary.dayDate.toISOString(),
          dailyQuota: mockItinerary.dailyQuota,
          totalEstimateCents: mockItinerary.totalEstimateCents,
          placeApiRef: mockItinerary.placeApiRef,
          notes: mockItinerary.notes,
          status: mockItinerary.status,
          createdAt: mockItinerary.createdAt.toISOString(),
        },
      ]);
    });

    it("should return 404 when trip is not found", async () => {
      prismaMock.trip.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/trip/${validTripId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "TRIP_NOT_FOUND",
        message: "Trip not found",
      });
    });

    it("should return 400 when tripId is invalid", async () => {
      const response = await request(app)
        .get(`${baseUrl}/trip/short`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });
  });

  describe("PATCH /api/v1/itineraries/:tripId/:id", () => {
    const updatePayload = {
      notes: "Updated notes",
      status: "ONGOING",
    };

    it("should return 201 when itinerary updates successfully", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.itinerary.findFirst.mockResolvedValue(null);
      prismaMock.itinerary.update.mockResolvedValue(mockItinerary);

      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(updatePayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "itinerary updated successfully" });
    });

    it("should return 400 when update payload is empty", async () => {
      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "At least one field must be provided",
      });
    });

    it("should return 404 when itinerary does not exist", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(updatePayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "ITINERARY_NOT_FOUND",
        message: "Itinerary not found",
      });
    });

    it("should return 404 when trip is missing", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.trip.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send(updatePayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "TRIP_NOT_FOUND",
        message: "Trip not found",
      });
    });

    it("should return 400 when the requested day is already taken", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.itinerary.findFirst.mockResolvedValue({
        id: 2n,
        publicId: "itinerary-taken-123",
        dayDate: new Date("2026-06-02"),
        dailyQuota: 1,
        status: "PLANNED",
        totalEstimateCents: 1200,
        placeApiRef: "place-api-ref-321",
        notes: "Busy day",
        createdAt: new Date("2026-05-14T00:00:00.000Z"),
        tripId: mockTrip.id,
      });

      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({ dayDate: "2026-06-02" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "INVALID_INPUT",
        message: "This day is not free",
      });
    });

    it("should return 409 when updating to a date outside trip boundaries", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip);
      prismaMock.itinerary.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .patch(`${baseUrl}/${validTripId}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({ dayDate: "2026-06-10" });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: "DAY_OUT_OF_RANGE_CONFLICT",
        message: "The Day is outside the range of trip days.",
      });
    });
  });

  describe("DELETE /api/v1/itineraries/:id", () => {
    it("should return 201 when itinerary is deleted", async () => {
      prismaMock.itinerary.delete.mockResolvedValue(mockItinerary);

      const response = await request(app)
        .delete(`${baseUrl}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "itinerary deleted successfully" });
    });

    it("should return 404 when delete target does not exist", async () => {
      prismaMock.itinerary.delete.mockRejectedValue(
       prismaNotFoundError
      );

      const response = await request(app)
        .delete(`${baseUrl}/${validItineraryId}`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: "NOT_FOUND",
        message: "Record not found",
      });
    });

    it("should return 400 when itinerary id is invalid", async () => {
      const response = await request(app)
        .delete(`${baseUrl}/short`)
        .set("Authorization", `Bearer ${validAccessToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });
  });
});

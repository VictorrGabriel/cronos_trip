import { jest } from "@jest/globals";
import request from "supertest";
import { mockDeep, mockReset } from "jest-mock-extended";
import type { DeepMockProxy } from "jest-mock-extended";
import type { PrismaClient } from "@prisma/client";

jest.mock("@lib/prisma", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

import { app } from "@/server";
import { prisma } from "@lib/prisma";
import {
  makeVisitationRecord,
  makeItineraryRecord,
  makeAccessToken,
} from "@shared/factories";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
const baseUrl = "/api/v1/visitations";

let accessToken: string;

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

describe("Visitation Routes", () => {
  const userId = "user-1234567890";
  const itineraryPublicId = "itinerary-123456789";
  const visitationPublicId = "visitation-123456789";

  beforeAll(() => {
    accessToken = makeAccessToken(userId);
  });
  const mockItinerary = makeItineraryRecord({
    publicId: itineraryPublicId,
    id: 1n,
    dailyQuota: 5,
  });
  const mockVisitation = makeVisitationRecord({
    publicId: visitationPublicId,
    itineraryId: 1n,
  });

  describe("POST /api/v1/visitations/:itineraryId - Create Visitation", () => {
    it("should create a visitation successfully with all valid fields", async () => {
      const payload = {
        priceCents: 2000,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
        isVisited: false,
      };

      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.count.mockResolvedValue(0);
      prismaMock.visitation.findFirst.mockResolvedValue(null);
      prismaMock.visitation.aggregate.mockResolvedValue({
        _sum: { durationMinutes: null },
      } as any);
      prismaMock.visitation.create.mockResolvedValue(
        makeVisitationRecord({
          publicId: visitationPublicId,
          ...payload,
          itineraryId: 1n,
        }),
      );

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(200);

      expect(response.body).toMatchObject({
        id: visitationPublicId,
        priceCents: payload.priceCents,
        visitOrder: payload.visitOrder,
        scheduleTime: payload.scheduleTime,
        durationMinutes: payload.durationMinutes,
        isVisited: payload.isVisited,
        itineraryId: itineraryPublicId,
        createdAt: expect.any(String),
      });
    });

    it("should create a visitation with only required priceCents and isVisited fields", async () => {
      const payload = {
        priceCents: 0,
        isVisited: true,
        visitOrder: null,
        scheduleTime: null,
        durationMinutes: null,
      };

      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.count.mockResolvedValue(0);
      prismaMock.visitation.aggregate.mockResolvedValue({
        _sum: { durationMinutes: null },
      } as any);
      prismaMock.visitation.create.mockResolvedValue(
        makeVisitationRecord({
          publicId: visitationPublicId,
          ...payload,
          itineraryId: 1n,
        }),
      );

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(200);

      expect(response.body).toMatchObject({
        id: visitationPublicId,
        priceCents: payload.priceCents,
        isVisited: payload.isVisited,
        itineraryId: itineraryPublicId,
        durationMinutes: null,
        scheduleTime: null,
        visitOrder: null,
        createdAt: expect.any(String),
      });
    });

    it("should return 401 when authorization header is missing", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .send(payload)
        .expect(401);

      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 400 when id is invalid", async () => {
      const invalidItineraryId = "invalid-id";
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${invalidItineraryId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });

    it("should return 400 when priceCents is negative", async () => {
      const payload = {
        priceCents: -100,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Price cents must be greater or equal to 0",
      });
    });

    it("should return 400 when priceCents is not an integer", async () => {
      const payload = {
        priceCents: 20.5,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Price cents must be a non-negative integer",
      });
    });

    it("should return 400 when visitOrder is greater than 10", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 11,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Visit order must be less or equal to 10",
      });
    });

    it("should return 400 when visitOrder is negative", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: -1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Visit order must be greater or equal to 0",
      });
    });

    it("should return 400 when scheduleTime format is invalid", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "25:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Schedule time must be in format '00:00' or null",
      });
    });

    it("should return 400 when durationMinutes is negative", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: -10,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Duration minutes must be greater or equal to 0",
      });
    });

    it("should return 400 when durationMinutes exceeds 86400 (24 hours)", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 86401,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Duration minutes must be less or equal to 86400",
      });
    });

    it("should return 400 when isVisited is not a boolean", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: "true",
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Is visited must be an boolean",
      });
    });

    it("should return 400 when request has extra fields", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
        extraField: "should not be here",
      };

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Unrecognized key: \"extraField\"",
      });
    });

    it("should return 404 when itinerary is not found", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      prismaMock.itinerary.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(404);

      expect(response.body).toEqual({
        code: "ITINERARY_NOT_FOUND",
        message: "Itinerary not found",
      });
    });

    it("should return 409 when visitation limit is reached (exceeds dailyQuota)", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const itineraryWithLowQuota = makeItineraryRecord({
        publicId: itineraryPublicId,
        id: 1n,
        dailyQuota: 2,
      });

      prismaMock.itinerary.findUnique.mockResolvedValue(itineraryWithLowQuota);
      prismaMock.visitation.count.mockResolvedValue(2);

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(409);

      expect(response.body).toEqual({
        code: "VISITATION_LIMIT_CONFLICT",
        message: `Itinerary ${itineraryPublicId} is full`,
      });
    });

    it("should return 400 when visit order is already taken", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 60,
      };

      const existingVisitation = makeVisitationRecord({
        itineraryId: 1n,
        visitOrder: 1,
      });

      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.count.mockResolvedValue(1);
      prismaMock.visitation.findFirst.mockResolvedValue(existingVisitation);

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "INVALID_INPUT",
        message: `Visit order  ${payload.visitOrder} is not free`,
      });
    });

    it("should return 400 when not enough minutes left in the day", async () => {
      const payload = {
        priceCents: 2000,
        isVisited: false,
        visitOrder: 1,
        scheduleTime: "10:00",
        durationMinutes: 1000,
      };

      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.count.mockResolvedValue(1);
      prismaMock.visitation.findFirst.mockResolvedValue(null);
      prismaMock.visitation.aggregate.mockResolvedValue({
        _sum: { durationMinutes: 1437 }, // 24 * 60 - 3 = 1437
      } as any);

      const response = await request(app)
        .post(`${baseUrl}/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toMatchObject({
        code: "INVALID_INPUT",
        message:
          expect.stringContaining("This day left only") &&
          expect.stringContaining("remaining minutes"),
      });
    });
  });

  describe("PATCH /api/v1/visitations/:id - Update Visitation", () => {
    it("should update a visitation with a single field", async () => {
      const payload = {
        isVisited: true,
      };

      prismaMock.visitation.findUnique.mockResolvedValueOnce(mockVisitation);
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.aggregate.mockResolvedValue({
        _sum: { durationMinutes: 60 },
      } as any);
      prismaMock.visitation.update.mockResolvedValue(
        makeVisitationRecord({
          publicId: visitationPublicId,
          isVisited: true,
          itineraryId: 1n,
        }),
      );

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({
        message: "Visitation updated successfully",
      });
    });

    it("should update a visitation with multiple fields", async () => {
      const payload = {
        priceCents: 3000,
        durationMinutes: 1,
        isVisited: true,
      };

      prismaMock.visitation.findUnique.mockResolvedValue(mockVisitation);
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.aggregate.mockResolvedValue({
        _sum: { durationMinutes: 150 },
      } as any);
      prismaMock.visitation.update.mockResolvedValue(
        makeVisitationRecord({
          publicId: visitationPublicId,
          ...payload,
          itineraryId: 1n,
        }),
      );

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({
        message: "Visitation updated successfully",
      });
    });

    it("should return 401 when authorization header is missing", async () => {
      const payload = {
        isVisited: true,
      };

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .send(payload)
        .expect(401);

      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 400 when visitation ID is invalid", async () => {
      const invalidId = "invalid-id";
      const payload = {
        isVisited: true,
      };

      const response = await request(app)
        .patch(`${baseUrl}/${invalidId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });

    it("should return 400 when no fields are provided for update", async () => {
      const payload = {};

      prismaMock.visitation.findUnique.mockResolvedValueOnce(mockVisitation);

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "At least one field must be provided",
      });
    });

    it("should return 400 when priceCents is invalid", async () => {
      const payload = {
        priceCents: -50,
      };

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Price cents must be greater or equal to 0",
      });
    });

    it("should return 400 when visitOrder exceeds 10", async () => {
      const payload = {
        visitOrder: 15,
      };

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Visit order must be less or equal to 10",
      });
    });

    it("should return 400 when scheduleTime format is invalid", async () => {
      const payload = {
        scheduleTime: "invalid-time",
      };

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Schedule time must be in format '00:00' or null",
      });
    });

    it("should return 400 when durationMinutes exceeds 86400", async () => {
      const payload = {
        durationMinutes: 100000,
      };

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(400);

      expect(response.body).toEqual({
        code: "VALIDATION_ERROR",
        message: "Duration minutes must be less or equal to 86400",
      });
    });

    it("should return 404 when visitation is not found", async () => {
      const payload = {
        isVisited: true,
      };

      prismaMock.visitation.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(404);

      expect(response.body).toEqual({
        code: "VISITATION_NOT_FOUND",
        message: "Visitation not found",
      });
    });

    it("should return 404 when associated itinerary is not found", async () => {
      const payload = {
        isVisited: true,
      };

      prismaMock.visitation.findUnique.mockResolvedValueOnce(mockVisitation);
      prismaMock.itinerary.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload)
        .expect(404);

      expect(response.body).toEqual({
        code: "ITINERARY_NOT_FOUND",
        message: "Itinerary not found",
      });
    });
  });

  it("should return 400 when visit order is already taken by another visitation", async () => {
    const payload = {
      visitOrder: 5,
    };

    const anotherVisitation = makeVisitationRecord({
      publicId: "another-visitation",
      itineraryId: 1n,
      visitOrder: 5,
    });

    prismaMock.visitation.findUnique.mockResolvedValue(mockVisitation);
    prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
    prismaMock.visitation.findFirst.mockResolvedValue(anotherVisitation);

    const response = await request(app)
      .patch(`${baseUrl}/${visitationPublicId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(payload)
      .expect(400);

    expect(response.body).toEqual({
      code: "INVALID_INPUT",
      message: expect.stringContaining("not free"),
    });
  });

  describe("GET /api/v1/visitations/itinerary/:itineraryId - Find All Visitationsby Itinerary", () => {
    it("should return all visitations for a given itinerary", async () => {
      const visitations = [
        makeVisitationRecord({
          publicId: "visitation-1",
          itineraryId: 1n,
          visitOrder: 1,
        }),
        makeVisitationRecord({
          publicId: "visitation-2",
          itineraryId: 1n,
          visitOrder: 2,
        }),
      ];

      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.findMany.mockResolvedValue(visitations);

      const response = await request(app)
        .get(`${baseUrl}/itinerary/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "visitation-1",
            itineraryId: itineraryPublicId,
          }),
          expect.objectContaining({
            id: "visitation-2",
            itineraryId: itineraryPublicId,
          }),
        ]),
      );
    });

    it("should return an empty array when no visitations exist for the itinerary", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);
      prismaMock.visitation.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get(`${baseUrl}/itinerary/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it("should return 401 when authorization header is missing", async () => {
      const response = await request(app)
        .get(`${baseUrl}/itinerary/${itineraryPublicId}`)
        .expect(401);

      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 400 when itineraryId param is invalid", async () => {
      const invalidItineraryId = "invalid-id";

      const response = await request(app)
        .get(`${baseUrl}/itinerary/${invalidItineraryId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });

    it("should return 404 when itinerary is not found", async () => {
      prismaMock.itinerary.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/itinerary/${itineraryPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toEqual({
        code: "ITINERARY_NOT_FOUND",
        message: "Itinerary not found",
      });
    });
  });

  describe("GET /api/v1/visitations/:id - Find Visitation by ID", () => {
    it("should return a visitation by its ID", async () => {
      prismaMock.visitation.findUnique.mockResolvedValue(mockVisitation);
      prismaMock.itinerary.findUnique.mockResolvedValue(mockItinerary);

      const response = await request(app)
        .get(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        id: visitationPublicId,
        priceCents: mockVisitation.priceCents,
        visitOrder: mockVisitation.visitOrder,
        scheduleTime: mockVisitation.scheduleTime,
        durationMinutes: mockVisitation.durationMinutes,
        isVisited: mockVisitation.isVisited,
        itineraryId: itineraryPublicId,
        createdAt: mockVisitation.createdAt.toISOString(),
      });
    });

    it("should return 401 when authorization header is missing", async () => {
      const response = await request(app)
        .get(`${baseUrl}/${visitationPublicId}`)
        .expect(401);

      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 400 when visitation ID is invalid", async () => {
      const invalidId = "invalid-id";

      const response = await request(app)
        .get(`${baseUrl}/${invalidId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toEqual({
        message: "Invalid id format",
        code: "INVALID_ID",
      });
    });

    it("should return 404 when visitation is not found", async () => {
      prismaMock.visitation.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toEqual({
        code: "VISITATION_NOT_FOUND",
        message: "Visitation not found",
      });
    });

    it("should return 404 when associated itinerary is not found", async () => {
      prismaMock.visitation.findUnique.mockResolvedValue(mockVisitation);
      prismaMock.itinerary.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body).toEqual({
        code: "ITINERARY_NOT_FOUND",
        message: "Itinerary not found",
      });
    });
  });

  describe("DELETE /api/v1/visitations/:id - Delete Visitation", () => {
    it("should delete a visitation successfully", async () => {
      prismaMock.visitation.delete.mockResolvedValue(mockVisitation);

      const response = await request(app)
        .delete(`${baseUrl}/${visitationPublicId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toEqual({
        message: "Visitation deleted successfully",
      });
    });

    it("should return 401 when authorization header is missing", async () => {
      const response = await request(app)
        .delete(`${baseUrl}/${visitationPublicId}`)
        .expect(401);

      expect(response.body).toEqual({
        message: "Missing or malformed authorization header",
        code: "INVALID_TOKEN",
      });
    });

    it("should return 400 when visitation ID is invalid", async () => {
      const invalidId = "invalid-id";

      const response = await request(app)
        .delete(`${baseUrl}/${invalidId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body).toEqual({
        code: "INVALID_ID",
        message: "Invalid id format",
      });
    });
  });
});

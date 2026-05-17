import type { Itinerary } from "@prisma/client";

export const makeItineraryRecord = (overrides: Partial<Itinerary> = {}): Itinerary => ({
  id: 1n,
  publicId: "itinerary-1234567890",
  dayDate: new Date("2026-06-02"),
  dailyQuota: 2,
  status: "PLANNED",
  totalEstimateCents: 1500,
  placeApiRef: "place-api-ref-123",
  notes: "Visit the museum",
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  tripId: 1n,
  ...overrides,
});

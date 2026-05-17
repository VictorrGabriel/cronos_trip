import type { Trip } from "@prisma/client";

export const makeTripRecord = (overrides: Partial<Trip> = {}): Trip => ({
  id: 1n,
  publicId: "trip-1234567890",
  name: "Sample Trip",
  startDate: new Date("2026-06-01"),
  endDate: new Date("2026-06-05"),
  status: "PLANNED",
  budgetCents: 10000,
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  userId: 1n,
  ...overrides,
});
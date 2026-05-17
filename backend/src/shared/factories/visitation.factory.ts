import type { Visitation } from "@prisma/client";

export const makeVisitationRecord = (overrides: Partial<Visitation> = {}): Visitation => ({
  id: 1n,
  publicId: "visitation-1234567890",
  priceCents: 2000,
  visitOrder: 1,
  scheduleTime: "10:00",
  durationMinutes: 60,
  isVisited: false,
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  itineraryId: 1n,
  ...overrides,
});

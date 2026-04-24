import { Prisma } from "@prisma/client";

export type TripDates = Prisma.TripGetPayload<{
  select: { startDate: true; endDate: true }
}>;
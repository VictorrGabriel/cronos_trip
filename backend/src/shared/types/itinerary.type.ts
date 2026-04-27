import type { Prisma } from "@prisma/client";

export type ItineraryDayDates = Prisma.ItineraryGetPayload<{
  select: { dayDate: true };
}>;

import { ProgressStatus } from "@prisma/client";
import type { TripDates } from "@shared/types/trip.type";
import type { CreateTripDTO } from "../dto";

export const toTimezoneMidnight = (date: Date, timezone: string): Date => {
  const timezoneDate = new Date(
    date.toLocaleDateString(undefined, { timeZone: timezone }),
  );

  timezoneDate.setHours(0, 0, 0, 0);
  return timezoneDate;
};

export const isValidProgressStatus = (
  status: string,
): status is ProgressStatus =>
  Object.values(ProgressStatus).includes(status as ProgressStatus);

const hasConflictDates = (
  conflictDatesList: TripDates[],
  data: CreateTripDTO,
) => {
  if (conflictDatesList.length > 0) {
   
  }
};

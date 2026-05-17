import type { UpdateTripDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { ProgressStatus, Prisma } from "@prisma/client";
import {
  cleanByAllowedKeys,
  toTimezoneMidnight,
  isValidProgressStatus,
} from "@shared/utils";
import {
  TripNotFoundError,
  TripCompletedError,
  InvalidTripDateError,
  InvalidTripStatusError,
  ConflictTripDate,
} from "@shared/errors";

export interface UsecaseUpdate {
  (
    tripRepository: TripRepository,
    data: UpdateTripDTO,
    id: string,
  ): Promise<void>;
}

const shouldThrowInvalidDateRange = (
  data: UpdateTripDTO,
  currentStartDate: Date,
  currentEndDate: Date,
): boolean => {
  if (data.startDate && !data.endDate) {
    return data.startDate > currentEndDate;
  }

  if (!data.startDate && data.endDate) {
    return currentStartDate > data.endDate;
  }

  if (data.startDate && data.endDate) {
    return data.startDate > data.endDate;
  }

  return false;
};

export const usecaseUpdate: UsecaseUpdate = async (
  tripRepository: TripRepository,
  data: UpdateTripDTO,
  id: string,
) => {
  const currentTrip = await tripRepository.findByPublicId(id);
  if (!currentTrip) {
    throw new TripNotFoundError();
  }

  if (currentTrip.status === "COMPLETED" || currentTrip.status === "CANCELED") {
    throw new TripCompletedError();
  }

  if (data.timezone) {
    const conflictDates = await tripRepository.findConflictDate(
      currentTrip.userId,
      data.startDate || currentTrip.startDate,
      data.endDate || currentTrip.endDate,
      currentTrip.id,
    );

    if (conflictDates.length > 0) {
      throw new ConflictTripDate({
        message: "Conflict dates",
        dateList: conflictDates.map((tripDates) => {
          return {
            startDate: tripDates.startDate.toLocaleDateString(undefined, {
              timeZone: data.timezone,
            }),
            endDate: tripDates.endDate.toLocaleDateString(undefined, {
              timeZone: data.timezone,
            }),
          };
        }),
      });
    }

    if (data.startDate) {
      const startDateInTimezone = toTimezoneMidnight(
        data.startDate,
        data.timezone,
      );

      const nowTimezone = toTimezoneMidnight(new Date(), data.timezone);

      if (startDateInTimezone < nowTimezone) {
        throw new InvalidTripDateError({
          message: "Start date must not be a past date",
        });
      }
    }

    if (
      shouldThrowInvalidDateRange(
        data,
        currentTrip.startDate,
        currentTrip.endDate,
      )
    ) {
      throw new InvalidTripDateError({
        message: "Start date must be smaller than end date",
      });
    }
  }

  if (data.status && !isValidProgressStatus(data.status)) {
    throw new InvalidTripStatusError({
      message: `Status ${data.status} is not a valid progress status`,
    });
  }

  const updateSource = {
    name: data.name,
    startDate: data.startDate,
    endDate: data.endDate,
    budgetCents: data.budgetCents,
    status:
      data.status !== undefined ? (data.status as ProgressStatus) : undefined,
  };

  const allowedKeys = [
    "name",
    "startDate",
    "endDate",
    "budgetCents",
    "status",
  ] as const;

  const tripEntity: Prisma.TripUpdateInput = cleanByAllowedKeys(
    updateSource,
    allowedKeys,
  );
  await tripRepository.update(currentTrip.id, tripEntity);
};

import type { TripUpdateDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { ProgressStatus, Prisma, type Trip } from "@prisma/client";
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
    data: TripUpdateDTO,
    id: string,
  ): Promise<void>;
}

const shouldThrowInvalidDateRange = (
  data: TripUpdateDTO,
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

interface ValidateUpdate {
  (
    tripRepository: TripRepository,
    data: TripUpdateDTO,
    currentTrip: Trip | null,
  ): Promise<Trip>;
}

const validateUpdate: ValidateUpdate = async (
  tripRepository,
  data,
  currentTrip,
) => {
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

  return currentTrip;
};

export const usecaseUpdate: UsecaseUpdate = async (
  tripRepository: TripRepository,
  data: TripUpdateDTO,
  id: string,
) => {
  const currentTrip = await tripRepository.findByPublicId(id);
  const trip = await validateUpdate(tripRepository, data, currentTrip);

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
  await tripRepository.update(trip.id, tripEntity);
};

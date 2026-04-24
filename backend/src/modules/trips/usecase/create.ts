import type { TripRepository } from "../repository.contract";
import type { UserRepository } from "@modules/users/repository.contract";
import type { CreateTripDTO, ResponseTripDTO } from "@shared/dto/trip.dto";
import { Prisma } from "@prisma/client";
import {
  pickByKeys,
  toTimezoneMidnight,
  isValidProgressStatus,
} from "@shared/utils";
import {
  UserNotFoundError,
  InvalidTripDateError,
  InvalidTripStatusError,
  ConflictTripDate,
} from "@shared/errors";

export interface UseCaseCreate {
  (
    tripRepository: TripRepository,
    userRepository: UserRepository,
    data: CreateTripDTO,
  ): Promise<ResponseTripDTO>;
}



export const useCaseCreate: UseCaseCreate = async (
  tripRepository: TripRepository,
  userRepository: UserRepository,
  data: CreateTripDTO,
) => {
  const startDateInTimezone = toTimezoneMidnight(data.startDate, data.timezone);
  const nowTimezone = toTimezoneMidnight(new Date(), data.timezone);
  const startDateTimestamp = data.startDate.getTime();
  const endDateTimestamp = data.endDate.getTime();

  const conflictDates = await tripRepository.findConflictDate(
    data.userId,
    data.startDate,
    data.endDate,
  );

  if(conflictDates.length > 0){
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

  if (startDateInTimezone < nowTimezone) {
    throw new InvalidTripDateError({
      message: "Trip must start in the present or future",
    });
  }

  if (startDateTimestamp >= endDateTimestamp) {
    throw new InvalidTripDateError({
      message: "Start date must be earlier than end date",
    });
  }

  if (!isValidProgressStatus(data.status)) {
    throw new InvalidTripStatusError({
      message: `Status ${data.status} is not a valid progress status`,
    });
  }

  const existingUser = await userRepository.existsById(data.userId);

  if (!existingUser) {
    throw new UserNotFoundError({ message: `User ${data.userId} not found` });
  }

  const baseCreateData = pickByKeys(data, [
    "name",
    "startDate",
    "endDate",
    "budgetCents",
    "status",
  ]);

  const tripEntity: Prisma.TripCreateInput = {
    ...baseCreateData,
    status: data.status,
    user: { connect: { id: data.userId } },
  };

  const trip = await tripRepository.create(tripEntity);

  const responseTrip: ResponseTripDTO = pickByKeys(
    { ...trip, id: String(trip.id) },
    [
      "id",
      "name",
      "startDate",
      "endDate",
      "status",
      "budgetCents",
      "createdAt",
    ],
  );

  return responseTrip;
};

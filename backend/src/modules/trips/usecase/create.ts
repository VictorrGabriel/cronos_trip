import type { TripRepository } from "../repository.contract";
import type { UserRepository } from "@modules/users/repository.contract";
import type { TripCreateDTO, TripResponseDTO } from "@shared/dto/trip.dto";
import { Prisma, ProgressStatus, type User } from "@prisma/client";
import {
  pickByKeys,
  toTimezoneMidnight,
  isValidProgressStatus,
  customNanoId,
  normalizeString,
  buildTripResponseDTO
} from "@shared/utils";
import {
  UserNotFoundError,
  InvalidTripDateError,
  InvalidTripStatusError,
  ConflictTripDate,
} from "@shared/errors";

export interface UsecaseCreate {
  (
    tripRepository: TripRepository,
    userRepository: UserRepository,
    data: TripCreateDTO,
  ): Promise<TripResponseDTO>;
}

interface ValidateCreate {
  (
    tripRepository: TripRepository,
    data: TripCreateDTO,
    existingUser: User | null,
  ): Promise<User>;
}

const validateCreate: ValidateCreate = async (
  tripRepository,
  data,
  existingUser,
) => {
  if (!existingUser) {
    throw new UserNotFoundError();
  }

  const conflictDates = await tripRepository.findConflictDate(
    existingUser.id,
    data.startDate,
    data.endDate,
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

  const startDateInTimezone = toTimezoneMidnight(data.startDate, data.timezone);
  const nowTimezone = toTimezoneMidnight(new Date(), data.timezone);
  const startDateTimestamp = data.startDate.getTime();
  const endDateTimestamp = data.endDate.getTime();

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

  return existingUser;
};

export const usecaseCreate: UsecaseCreate = async (
  tripRepository: TripRepository,
  userRepository: UserRepository,
  data: TripCreateDTO,
) => {
  const existingUser = await userRepository.findByPublicId(data.userId);
  const user = await validateCreate(tripRepository, data, existingUser);

  const publicId = normalizeString(data.name) + "#" + customNanoId(10);

  const baseCreateData = pickByKeys(data, [
    "name",
    "startDate",
    "endDate",
    "budgetCents",
    "status",
  ]);

  const tripEntity: Prisma.TripCreateInput = {
    ...baseCreateData,
    status: data.status as ProgressStatus,
    publicId,
    user: { connect: { id: user.id } },
  };

  const trip = await tripRepository.create(tripEntity);

  const responseTrip: TripResponseDTO = buildTripResponseDTO(trip, data.userId);

  return responseTrip;
};

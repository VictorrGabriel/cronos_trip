import type { ItineraryUpdateDTO, ItineraryResponseDTO } from "@shared/dto/";
import { type ItineraryRepository } from "../repository.contract";
import type { TripRepository } from "@modules/trips/repository.contract";
import {
  TripNotFoundError,
  InvalidInputError,
  DateOutOfRengeError,
  ItineraryNotFoundError,
} from "@shared/errors";
import {
  isValidApiReference,
  isValidDailyQuota,
  isValidDayDate,
  isValidProgressStatus,
  isValidTotalEstimateCents,
  cleanByAllowedKeys,
} from "@shared/utils";
import type { Prisma } from "@prisma/client";

export interface UsecaseUpdate {
  (
    itinerariesRepository: ItineraryRepository,
    tripRepository: TripRepository,
    itineraryId: bigint,
    data: ItineraryUpdateDTO,
  ): Promise<void>;
}

export const usecaseUpdate: UsecaseUpdate = async (
  itinerariesRepository,
  tripRepository,
  itineraryId,
  data,
) => {
  const itinerary = await itinerariesRepository.findById(itineraryId);

  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  const trip = await tripRepository.findById(data.tripId);

  if (!trip) {
    throw new TripNotFoundError();
  }

  if (data.dayDate) {
    const isFree = await itinerariesRepository.isFreeDay(
      itineraryId,
      data.dayDate,
    );

    if (!isFree) {
      throw new InvalidInputError({ message: "This day is not free" });
    }

    if (
      data.dayDate &&
      !isValidDayDate(trip.startDate, trip.endDate, data.dayDate)
    ) {
      throw new DateOutOfRengeError({
        message: "The Day is outside the range of trip days.",
      });
    }
  }

  if (data.dailyQuota && !isValidDailyQuota(data.dailyQuota)) {
    throw new InvalidInputError({
      message: "Day quota must be an integer between 0 and 10",
    });
  }

  if (
    data.totalEstimateCents &&
    !isValidTotalEstimateCents(data.totalEstimateCents)
  ) {
    throw new InvalidInputError({
      message: "Total estimate must be an integer and greater or equal to 0",
    });
  }

  /* Simulate forsquare publuc id validation */
  if (data.placeApiRef && !isValidApiReference(data.placeApiRef)) {
    throw new InvalidInputError({ message: "Api reference is invali" });
  }

  if (data.notes && data.notes.length > 300) {
    throw new InvalidInputError({
      message: "Notes must have less than 300 charecters",
    });
  }

  if (data.status && !isValidProgressStatus(data.status)) {
    throw new InvalidInputError({ message: "Invalid status" });
  }

  const baseCreateItinerary = cleanByAllowedKeys(data, [
    "dailyQuota",
    "dayDate",
    "notes",
    "placeApiRef",
    "totalEstimateCents",
  ]);

  const itineraryEntity: Prisma.ItineraryUpdateInput = {
    ...baseCreateItinerary,
    trip: { connect: { id: data.tripId } },
  };

  await itinerariesRepository.update(itineraryId, itineraryEntity);
};

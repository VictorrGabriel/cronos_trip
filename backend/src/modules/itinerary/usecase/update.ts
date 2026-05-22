import type { ItineraryUpdateDTO } from "@shared/dto/";
import { type ItineraryRepository } from "../repository.contract";
import type { TripRepository } from "@/modules/trip/repository.contract";
import {
  TripNotFoundError,
  InvalidInputError,
  DateOutOfRengeError,
  ItineraryNotFoundError,
} from "@shared/errors";
import { cleanByAllowedKeys, isValidProgressStatus } from "@shared/utils";
import {
  isValidApiReference,
  isValidDailyQuota,
  isValidDayDate,
  isValidTotalEstimateCents,
} from "./helpers";
import type { Itinerary, Prisma, Trip } from "@prisma/client";
import { getEntityFromUpdateDTO } from "./mappers";

export interface UsecaseUpdate {
  (
    itineraryRepository: ItineraryRepository,
    tripRepository: TripRepository,
    itineraryId: string,
    data: ItineraryUpdateDTO,
  ): Promise<void>;
}

interface ValidateUpdate {
  (
    itineraryRepository: ItineraryRepository,
    data: ItineraryUpdateDTO,
    itinerary: Itinerary | null,
    trip: Trip | null,
  ): Promise<{ itinerary: Itinerary; trip: Trip }>;
}

const validateUpdate: ValidateUpdate = async (
  itineraryRepository,
  data,
  itinerary,
  trip,
) => {
  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  if (!trip) {
    throw new TripNotFoundError();
  }

  if (data.dayDate) {
    const isFree = await itineraryRepository.isFreeDay(trip.id, data.dayDate);

    if (!isFree) {
      throw new InvalidInputError({ message: "This day is not free" });
    }

    if (!isValidDayDate(trip.startDate, trip.endDate, data.dayDate)) {
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

  return { itinerary, trip };
};

export const usecaseUpdate: UsecaseUpdate = async (
  itineraryRepository,
  tripRepository,
  itineraryId,
  data,
) => {
  const itinerary = await itineraryRepository.findByPublicId(itineraryId);
  const trip = await tripRepository.findByPublicId(data.tripId);

  const existingItinerary = await validateUpdate(
    itineraryRepository,
    data,
    itinerary,
    trip,
  );

  const itineraryEntity = getEntityFromUpdateDTO(data, existingItinerary.trip);

  await itineraryRepository.update(
    existingItinerary.itinerary.id,
    itineraryEntity,
  );
};

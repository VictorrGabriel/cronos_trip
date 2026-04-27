import type { ItineraryCreateDTO, ItineraryResponseDTO } from "@shared/dto/";
import { type ItineraryRepository } from "../repository.contract";
import type { TripRepository } from "@modules/trips/repository.contract";
import {
  TripNotFoundError,
  InvalidInputError,
  DateOutOfRengeError,
} from "@shared/errors";
import {
  pickByKeys,
  isValidProgressStatus,
  isValidTotalEstimateCents,
  isValidApiReference,
  isValidDailyQuota,
  isValidDayDate
} from "@shared/utils";
import type { Prisma } from "@prisma/client";

export interface UsecaseCreate {
  (
    itinerariesRepository: ItineraryRepository,
    tripRepository: TripRepository,
    data: ItineraryCreateDTO,
  ): Promise<ItineraryResponseDTO>;
}

export const usecaseCreate: UsecaseCreate = async (
  itinerariesRepository,
  tripRepository,
  data,
) => {
  const trip = await tripRepository.findById(data.tripId);

  if (!trip) {
    throw new TripNotFoundError();
  }
  const isFreeDay = await itinerariesRepository.isFreeDay(data.tripId, data.dayDate);
  if(!isFreeDay){
     throw new InvalidInputError({ message: "This day is not free" });
  }

  if (!isValidDayDate(trip.startDate, trip.endDate, data.dayDate)) {
    throw new DateOutOfRengeError({
      message: "The Day is outside the range of trip days.",
    });
  }

  if (!isValidDailyQuota(data.dailyQuota)) {
    throw new InvalidInputError({
      message: "Day quota must be an integer between 0 and 10",
    });
  }

  if (!isValidTotalEstimateCents(data.totalEstimateCents)) {
    throw new InvalidInputError({
      message: "Total estimate must be an integer and greater or equal to 0",
    });
  }

  /* Simulate forsquare publuc id validation */
  if (!isValidApiReference(data.placeApiRef)) {
    throw new InvalidInputError({ message: "Api reference is invali" });
  }

  if (data.notes.length > 300) {
    throw new InvalidInputError({
      message: "Notes must have less than 300 charecters",
    });
  }

  if (!isValidProgressStatus(data.status)) {
    throw new InvalidInputError({ message: "Invalid status" });
  }

  const baseCreateItinerary = pickByKeys(data, [
    "dailyQuota",
    "dayDate",
    "notes",
    "placeApiRef",
    "totalEstimateCents",
  ]);

  const itineraryEntity: Prisma.ItineraryCreateInput = {
    ...baseCreateItinerary,
    trip: { connect: { id: data.tripId } },
  };

  const itinerary = await itinerariesRepository.create(itineraryEntity);

  const itineraryResponse: ItineraryResponseDTO = {
    ...itinerary,
    id: String(itinerary.id),
    tripId: String(itinerary.tripId)
  };

  return itineraryResponse;
};

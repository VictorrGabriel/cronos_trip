import type { TripRepository } from "@/modules/trip/repository.contract";
import type { Trip } from "@prisma/client";
import type { ItineraryCreateDTO, ItineraryResponseDTO } from "@shared/dto/";
import {
  DateOutOfRengeError,
  InvalidInputError,
  TripNotFoundError,
} from "@shared/errors";
import {
  customNanoId,
  isValidProgressStatus,
} from "@shared/utils";
import { type ItineraryRepository } from "../repository.contract";
import {
  isValidApiReference,
  isValidDailyQuota,
  isValidDayDate,
  isValidTotalEstimateCents,
} from "./helpers";
import { getEntityFromCreateDTO, getItineraryResponseDTO } from "./mappers";

export interface UsecaseCreate {
  (
    itinerariesRepository: ItineraryRepository,
    tripRepository: TripRepository,
    data: ItineraryCreateDTO,
  ): Promise<ItineraryResponseDTO>;
}

interface ValidateCreate {
  (
    itinerariesRepository: ItineraryRepository,
    data: ItineraryCreateDTO,
    trip: Trip | null,
  ): Promise<Trip>;
}

const validateCreate: ValidateCreate = async (
  itinerariesRepository,
  data,
  trip,
) => {
  if (!trip) {
    throw new TripNotFoundError();
  }

  const isFreeDay = await itinerariesRepository.isFreeDay(
    trip.id,
    data.dayDate,
  );
  if (!isFreeDay) {
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

  return trip;
};

export const usecaseCreate: UsecaseCreate = async (
  itinerariesRepository,
  tripRepository,
  data,
) => {
  const trip = await tripRepository.findByPublicId(data.tripId);
  const existingTrip = await validateCreate(itinerariesRepository, data, trip);

  const publicId = customNanoId(21);

  const itineraryEntity = getEntityFromCreateDTO(data, publicId, existingTrip);
  const itinerary = await itinerariesRepository.create(itineraryEntity);

  const itineraryResponse: ItineraryResponseDTO = getItineraryResponseDTO(
    itinerary,
    existingTrip.publicId,
  );

  return itineraryResponse;
};

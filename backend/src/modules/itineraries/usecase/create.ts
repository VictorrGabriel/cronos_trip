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
  isValidDayDate,
  customNanoId,
  buildItineraryResponseDTO,
} from "@shared/utils";
import type { Prisma, Trip } from "@prisma/client";

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
  const existingTrip = await validateCreate(
    itinerariesRepository,
    data,
    trip,
  );

  const baseCreateItinerary = pickByKeys(data, [
    "dailyQuota",
    "dayDate",
    "notes",
    "placeApiRef",
    "totalEstimateCents",
  ]);

  const publicId = customNanoId(21);

  const itineraryEntity: Prisma.ItineraryCreateInput = {
    ...baseCreateItinerary,
    publicId,
    trip: { connect: { id: existingTrip.id } },
  };

  const itinerary = await itinerariesRepository.create(itineraryEntity);

  const itineraryResponse: ItineraryResponseDTO = buildItineraryResponseDTO(
    itinerary,
    existingTrip.publicId,
  );

  return itineraryResponse;
};

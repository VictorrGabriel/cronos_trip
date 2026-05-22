import type { TripRepository } from "@/modules/trip/repository.contract";
import type { Trip } from "@prisma/client";
import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import { TripNotFoundError } from "@shared/errors";
import type { ItineraryRepository } from "../repository.contract";
import { getItineraryResponseDTO } from "./mappers";

export interface UsecaseFindAllByTripId {
  (
    itinerariesRepository: ItineraryRepository,
    tripRepository: TripRepository,
    tripId: string,
  ): Promise<ItineraryResponseDTO[]>;
}

interface ValidateFindAllByTripId {
  (trip: Trip | null): Trip;
}

const validateFindAllByTripId: ValidateFindAllByTripId = (trip) => {
  if (!trip) {
    throw new TripNotFoundError();
  }

  return trip;
};

export const usecaseFindAllByTripId: UsecaseFindAllByTripId = async (
  itinerariesRepository,
  tripRepository,
  tripId,
) => {
  const trip = await tripRepository.findByPublicId(tripId);
  const existingTrip = validateFindAllByTripId(trip);

  const itineraries = await itinerariesRepository.findByTripId(existingTrip.id);

  const itinerariesResponse: ItineraryResponseDTO[] = [];

  for (const itinerary of itineraries) {
    const itineraryResponse: ItineraryResponseDTO = getItineraryResponseDTO(
      itinerary,
      existingTrip.publicId,
    );

    itinerariesResponse.push(itineraryResponse);
  }

  return itinerariesResponse;
};

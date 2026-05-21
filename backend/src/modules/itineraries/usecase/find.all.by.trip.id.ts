import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import type { ItineraryRepository } from "../repository.contract";
import { TripNotFoundError } from "@shared/errors";
import type { TripRepository } from "@modules/trips/repository.contract";
import { buildItineraryResponseDTO } from "@/shared/utils";
import type { Trip } from "@prisma/client";

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
    const itineraryResponse: ItineraryResponseDTO = buildItineraryResponseDTO(
      itinerary,
      existingTrip.publicId,
    );

    itinerariesResponse.push(itineraryResponse);
  }

  return itinerariesResponse;
};

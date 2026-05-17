import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import type { ItineraryRepository } from "../repository.contract";
import { ItineraryNotFoundError, TripNotFoundError } from "@shared/errors";
import type { TripRepository } from "@modules/trips/repository.contract";
import { pickByKeys, buildItineraryResponseDTO } from "@/shared/utils";

export interface UsecaseFindAllByTripId {
  (
    itinerariesRepository: ItineraryRepository,
    tripRepository: TripRepository,
    tripId: string,
  ): Promise<ItineraryResponseDTO[]>;
}

export const usecaseFindAllByTripId: UsecaseFindAllByTripId = async (
  itinerariesRepository,
  tripRepository,
  tripId,
) => {

  const trip = await tripRepository.findByPublicId(tripId);

  if(!trip){
    throw new TripNotFoundError();
  }

  const itineraries = await itinerariesRepository.findByTripId(trip.id);

  const itinerariesResponse: ItineraryResponseDTO[] = [];

  for (const itinerary of itineraries) {
    const itineraryResponse: ItineraryResponseDTO = buildItineraryResponseDTO(itinerary, trip.publicId);

    itinerariesResponse.push(itineraryResponse);
  }

  return itinerariesResponse;
};

import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import type { ItineraryRepository } from "../repository.contract";
import { ItineraryNotFoundError } from "@shared/errors";

export interface UsecaseFindAllByTripId {
  (
    itinerariesRepository: ItineraryRepository,
    tripId: bigint,
  ): Promise<ItineraryResponseDTO[]>;
}

export const usecaseFindAllByTripId: UsecaseFindAllByTripId = async (
  itinerariesRepository,
  tripId,
) => {
  const itineraries = await itinerariesRepository.findByTripId(tripId);

  const itinerariesResponse: ItineraryResponseDTO[] = [];

  for (const itinerary of itineraries) {
    itinerariesResponse.push({ ...itinerary, id: String(itinerary.id), tripId: String(itinerary.tripId) });
  }

  return itinerariesResponse;
};

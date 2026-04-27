import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import type { ItineraryRepository } from "../repository.contract";
import { ItineraryNotFoundError } from "@shared/errors";

export interface UsecaseFindById {
  (
    itinerariesRepository: ItineraryRepository,
    itineraryId: bigint,
  ): Promise<ItineraryResponseDTO>;
}

export const usecaseFindById: UsecaseFindById = async (
  itinerariesRepository,
  itineraryId,
) => {
  const itinerary = await itinerariesRepository.findById(itineraryId);

  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  const itineraryResponse: ItineraryResponseDTO = {
    ...itinerary,
    id: String(itinerary.id),
    tripId: String(itinerary.tripId),
  };

  return itineraryResponse;
};

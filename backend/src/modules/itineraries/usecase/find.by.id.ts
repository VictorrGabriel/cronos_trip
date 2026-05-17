import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import type { ItineraryRepository } from "../repository.contract";
import { ItineraryNotFoundError, TripNotFoundError } from "@shared/errors";
import type { TripRepository } from "@modules/trips/repository.contract";
import { buildItineraryResponseDTO } from "@/shared/utils";

export interface UsecaseFindById {
  (
    itinerariesRepository: ItineraryRepository,
    tripRepository: TripRepository,
    itineraryId: string,
  ): Promise<ItineraryResponseDTO>;
}

export const usecaseFindById: UsecaseFindById = async (
  itinerariesRepository,
  tripRepository,
  itineraryId,
) => {
  const itinerary = await itinerariesRepository.findByPublicId(itineraryId);
  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }
  const trip = await tripRepository.findById(itinerary.tripId);

  if (!trip) {
    throw new TripNotFoundError();
  }

  const itineraryResponse: ItineraryResponseDTO = buildItineraryResponseDTO(
    itinerary,
    trip.publicId,
  );
  return itineraryResponse;
};

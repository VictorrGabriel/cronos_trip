import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import type {
  ItineraryRepository,
  ItineraryWithTripPublicId,
} from "../repository.contract";
import { ItineraryNotFoundError } from "@shared/errors";
import type { TripRepository } from "@modules/trips/repository.contract";
import { buildItineraryResponseDTO } from "@/shared/utils";

export interface UsecaseFindById {
  (
    itinerariesRepository: ItineraryRepository,
    tripRepository: TripRepository,
    itineraryId: string,
  ): Promise<ItineraryResponseDTO>;
}

interface ValidateFindById {
  (itinerary: ItineraryWithTripPublicId | null): ItineraryWithTripPublicId;
}

const validateFindById: ValidateFindById = (itinerary) => {
  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  return itinerary;
};

export const usecaseFindById: UsecaseFindById = async (
  itinerariesRepository,
  _tripRepository,
  itineraryId,
) => {
  const itinerary = await itinerariesRepository.findByPublicIdWithTripPublicId(
    itineraryId,
  );
  const existingItinerary = validateFindById(itinerary);

  const itineraryResponse: ItineraryResponseDTO = buildItineraryResponseDTO(
    existingItinerary,
    existingItinerary.trip.publicId,
  );
  return itineraryResponse;
};

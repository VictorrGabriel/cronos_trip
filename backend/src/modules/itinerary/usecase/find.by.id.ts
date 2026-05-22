import type { TripRepository } from "@/modules/trip/repository.contract";
import type { ItineraryResponseDTO } from "@shared/dto/itinerary.dto";
import { ItineraryNotFoundError } from "@shared/errors";
import type {
  ItineraryRepository,
  ItineraryWithTripPublicId,
} from "../repository.contract";
import { getItineraryResponseDTO } from "./mappers";

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
  const itinerary =
    await itinerariesRepository.findByPublicIdWithTripPublicId(itineraryId);
  const existingItinerary = validateFindById(itinerary);

  const itineraryResponse: ItineraryResponseDTO = getItineraryResponseDTO(
    existingItinerary,
    existingItinerary.trip.publicId,
  );
  return itineraryResponse;
};

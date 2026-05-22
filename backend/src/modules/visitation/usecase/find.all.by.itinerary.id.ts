import type { VisitationResponseDTO } from "@shared/dto";
import type { VisitationRepository } from "../repository.contract";
import type { ItineraryRepository } from "@/modules/itinerary/repository.contract";
import { ItineraryNotFoundError } from "@shared/errors";
import { getVisitationResponseDTO } from "./mappers";
import type { Itinerary } from "@prisma/client";

export interface UsecaseFindAllByItineraryId {
  (
    visitationRepository: VisitationRepository,
    itinerariesRepository: ItineraryRepository,
    itineraryId: string,
  ): Promise<VisitationResponseDTO[]>;
}

interface ValidateFindAllByItineraryId {
  (itinerary: Itinerary | null): Itinerary;
}

const validateFindAllByItineraryId: ValidateFindAllByItineraryId = (
  itinerary,
) => {
  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }

  return itinerary;
};

export const usecaseFindAllByItineraryId: UsecaseFindAllByItineraryId = async (
  visitationRepository,
  itinerariesRepository,
  itineraryId,
) => {
  const itinerary = await itinerariesRepository.findByPublicId(itineraryId);
  const existingItinerary = validateFindAllByItineraryId(itinerary);

  const visitations = await visitationRepository.findByItineraryId(
    existingItinerary.id,
  );

  const visitationsResponse: VisitationResponseDTO[] = [];
  for (const visitation of visitations) {
    const visitationResponse: VisitationResponseDTO = getVisitationResponseDTO(
      visitation,
      existingItinerary.publicId,
    );
    visitationsResponse.push(visitationResponse);
  }
  
  return visitationsResponse;
};

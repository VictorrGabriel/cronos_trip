import type { VisitationResponseDTO } from "@shared/dto/visitation.dto";
import type { VisitationRepository } from "../repository.contract";
import type { ItineraryRepository } from "@modules/itineraries/repository.contract";
import { ItineraryNotFoundError } from "@shared/errors";
import { buildVisitationResponseDTO } from "@/shared/utils/dto.response.builders";

export interface UsecaseFindAllByItineraryId {
  (
    visitationRepository: VisitationRepository,
    itinerariesRepository: ItineraryRepository,
    itineraryId: string,
  ): Promise<VisitationResponseDTO[]>;
}

export const usecaseFindAllByItineraryId: UsecaseFindAllByItineraryId = async (
  visitationRepository,
  itinerariesRepository,
  itineraryId,
) => {

  const itinerary = await itinerariesRepository.findByPublicId(itineraryId);

  if(!itinerary){
    throw new ItineraryNotFoundError();
  }

  const visitations = await visitationRepository.findByItineraryId(itinerary.id);

  const visitationsResponse: VisitationResponseDTO[] = [];
  for (const visitation of visitations) {
      const visitationResponse: VisitationResponseDTO = buildVisitationResponseDTO(
        visitation,
        itinerary.publicId,
      );
    visitationsResponse.push(visitationResponse);
  }
  
  return visitationsResponse;
};

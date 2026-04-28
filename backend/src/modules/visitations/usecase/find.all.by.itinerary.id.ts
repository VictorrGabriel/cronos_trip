import type { VisitationResponseDTO } from "@shared/dto/visitation.dto";
import type { VisitationRepository } from "../repository.contract";

export interface UsecaseFindAllByItineraryId {
  (
    visitationRepository: VisitationRepository,
    itineraryId: bigint,
  ): Promise<VisitationResponseDTO[]>;
}

export const usecaseFindAllByItineraryId: UsecaseFindAllByItineraryId = async (
  visitationRepository,
  itineraryId,
) => {
  const visitations = await visitationRepository.findByItineraryId(itineraryId);

  const visitationsResponse: VisitationResponseDTO[] = [];
  for (const visitation of visitations) {
    visitationsResponse.push({
      ...visitation,
      id: String(visitation.id),
      itineraryId: String(visitation.itineraryId),
    });
  }
  
  return visitationsResponse;
};

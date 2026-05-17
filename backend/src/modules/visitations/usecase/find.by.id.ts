import type { VisitationResponseDTO } from "@shared/dto/visitation.dto";
import type { VisitationRepository } from "../repository.contract";
import {
  ItineraryNotFoundError,
  VisitationNotFoundError,
} from "@shared/errors";
import type { ItineraryRepository } from "@modules/itineraries/repository.contract";
import { buildVisitationResponseDTO } from "@/shared/utils";

export interface UsecaseFindById {
  (
    visitationRepository: VisitationRepository,
    itinerariesRepository: ItineraryRepository,
    visitationId: string,
  ): Promise<VisitationResponseDTO>;
}

export const usecaseFindById: UsecaseFindById = async (
  visitationRepository,
  itinerariesRepository,
  visitationId,
) => {
  const visitation = await visitationRepository.findByPublicId(visitationId);

  if (!visitation) {
    throw new VisitationNotFoundError();
  }
  const itinerary = await itinerariesRepository.findById(
    visitation.itineraryId,
  );
  if (!itinerary) {
    throw new ItineraryNotFoundError();
  }


  const visitationResponse: VisitationResponseDTO = buildVisitationResponseDTO(visitation, itinerary.publicId);

  return visitationResponse;
};

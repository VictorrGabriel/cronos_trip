import type { VisitationResponseDTO } from "@shared/dto/visitation.dto";
import type { VisitationRepository } from "../repository.contract";
import { VisitationNotFoundError } from "@shared/errors";

export interface UsecaseFindById {
  (
    visitationRepository: VisitationRepository,
    visitationId: bigint,
  ): Promise<VisitationResponseDTO>;
}

export const usecaseFindById: UsecaseFindById = async (
  visitationRepository,
  visitationId,
) => {
  const visitation = await visitationRepository.findById(visitationId);

  if (!visitation) {
    throw new VisitationNotFoundError();
  }

  const visitationResponse: VisitationResponseDTO = {
    ...visitation,
    id: String(visitation.id),
    itineraryId: String(visitation.itineraryId),
  };

  return visitationResponse;
};

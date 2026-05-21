import type { VisitationResponseDTO } from "@shared/dto/visitation.dto";
import type {
  VisitationRepository,
  VisitationWithItineraryPublicId,
} from "../repository.contract";
import { VisitationNotFoundError } from "@shared/errors";
import type { ItineraryRepository } from "@modules/itineraries/repository.contract";
import { buildVisitationResponseDTO } from "@/shared/utils";

export interface UsecaseFindById {
  (
    visitationRepository: VisitationRepository,
    itinerariesRepository: ItineraryRepository,
    visitationId: string,
  ): Promise<VisitationResponseDTO>;
}

interface ValidateFindById {
  (
    visitation: VisitationWithItineraryPublicId | null,
  ): VisitationWithItineraryPublicId;
}

const validateFindById: ValidateFindById = (visitation) => {
  if (!visitation) {
    throw new VisitationNotFoundError();
  }

  return visitation;
};

export const usecaseFindById: UsecaseFindById = async (
  visitationRepository,
  _itinerariesRepository,
  visitationId,
) => {
  const visitation =
    await visitationRepository.findByPublicIdWithItineraryPublicId(
      visitationId,
    );
  const existingVisitation = validateFindById(visitation);

  const visitationResponse: VisitationResponseDTO = buildVisitationResponseDTO(
    existingVisitation,
    existingVisitation.itinerary.publicId,
  );

  return visitationResponse;
};

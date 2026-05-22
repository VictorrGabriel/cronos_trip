import type { VisitationRepository } from "../repository.contract";

export interface UsecaseDelete {
  (
    visitationRepository: VisitationRepository,
    visitationId: string,
  ): Promise<void>;
}

export const usecaseDelete: UsecaseDelete = async (
  visitationRepository,
  visitationId,
) => {
  await visitationRepository.deleteByPublicId(visitationId);
};

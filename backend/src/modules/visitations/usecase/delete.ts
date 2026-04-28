import type { VisitationRepository } from "../repository.contract";

export interface UsecaseDelete {
  (
    visitationRepository: VisitationRepository,
    visitationId: bigint,
  ): Promise<void>;
}

export const usecaseDelete: UsecaseDelete = async (
  visitationRepository,
  visitationId,
) => {
  await visitationRepository.delete(visitationId);
};

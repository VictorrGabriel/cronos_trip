import type { ItineraryRepository } from "../repository.contract";

export interface UsecaseDelete {
  (
    itineraryRepository: ItineraryRepository,
    itineraryId: bigint,
  ): Promise<void>;
}

export const usecaseDelete: UsecaseDelete = async (
  itineraryRepository,
  itineraryId,
) => {
  await itineraryRepository.delete(itineraryId);
};

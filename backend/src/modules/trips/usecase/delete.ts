import type { TripRepository } from "../repository.contract";

export interface UseCaseDelete {
  (tripRepository: TripRepository, id: bigint): Promise<void>;
}

export const useCaseDelete: UseCaseDelete = async (
  tripRepository: TripRepository,
  id: bigint,
) => {
  await tripRepository.delete(id);
};

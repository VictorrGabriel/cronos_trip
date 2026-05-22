import type { TripRepository } from "../repository.contract";

export interface UsecaseDelete {
  (tripRepository: TripRepository, id: string): Promise<void>;
}

export const usecaseDelete: UsecaseDelete = async (
  tripRepository: TripRepository,
  id: string,
) => {
  await tripRepository.deleteByPublicId(id);
};

import type { TripResponseDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { buildTripResponseDTO } from "@shared/utils";

export interface UsecaseFindByUserId {
  (tripRepository: TripRepository, userId: string): Promise<TripResponseDTO[]>;
}

export const usecaseFindByUserId: UsecaseFindByUserId = async (
  tripRepository,
  userId,
) => {
  const trips = await tripRepository.findByUserPublicId(userId);

  const responseTripList: TripResponseDTO[] = [];

  for (const trip of trips) {
    const responseTrip: TripResponseDTO = buildTripResponseDTO(trip, userId);
    responseTripList.push(responseTrip);
  }

  return responseTripList;
};

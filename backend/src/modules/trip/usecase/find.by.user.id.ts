import type { TripResponseDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { getTripResponseDTO } from "./mappers";

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
    const responseTrip = getTripResponseDTO(trip, userId);
    responseTripList.push(responseTrip);
  }

  return responseTripList;
};

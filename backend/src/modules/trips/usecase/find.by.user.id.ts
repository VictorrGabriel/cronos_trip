import type { ResponseTripDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { buildTripResponseDTO, pickByKeys } from "@shared/utils";

export interface UsecaseFindByUserId {
  (tripRepository: TripRepository, userId: string): Promise<ResponseTripDTO[]>;
}

export const usecaseFindByUserId: UsecaseFindByUserId = async (
  tripRepository,
  userId,
) => {
  const trips = await tripRepository.findByUserPublicId(userId);

  const responseTripList: ResponseTripDTO[] = [];

  for (const trip of trips) {
    const responseTrip: ResponseTripDTO = buildTripResponseDTO(trip, userId);
    responseTripList.push(responseTrip);
  }

  return responseTripList;
};

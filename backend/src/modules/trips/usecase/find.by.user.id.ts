import type { ResponseTripDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { pickByKeys } from "@shared/utils";

export interface UseCaseFindByUserId {
  (tripRepository: TripRepository, userId: bigint): Promise<ResponseTripDTO[]>;
}

export const useCaseFindByUserId: UseCaseFindByUserId = async (
  tripRepository: TripRepository,
  userId: bigint,
) => {
  const trips = await tripRepository.findByUserId(userId);

  const responseTrip: ResponseTripDTO[] = [];

  for (const trip of trips) {
    responseTrip.push(
      pickByKeys({ ...trip, id: String(trip.id) }, [
        "id",
        "name",
        "startDate",
        "endDate",
        "status",
        "budgetCents",
        "createdAt",
      ]),
    );
  }

  return responseTrip;
};

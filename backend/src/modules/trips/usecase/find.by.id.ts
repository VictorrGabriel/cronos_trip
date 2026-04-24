import type { ResponseTripDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { pickByKeys } from "@shared/utils";
import { TripNotFoundError } from "@shared/errors";

export interface UseCaseFindById {
  (tripRepository: TripRepository, id: bigint): Promise<ResponseTripDTO>;
}

export const useCaseFindById: UseCaseFindById = async (
  tripRepository: TripRepository,
  id: bigint,
) => {
  const trip = await tripRepository.findById(id);
  if (trip === null) {
    throw new TripNotFoundError();
  }

  const responseTrip: ResponseTripDTO = pickByKeys({...trip, id: String(trip.id)}, [
    "id",
    "name",
    "startDate",
    "endDate",
    "status",
    "budgetCents",
    "createdAt",
  ]);
  return responseTrip;
};

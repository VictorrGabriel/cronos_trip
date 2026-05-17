import type { ResponseTripDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { pickByKeys, buildTripResponseDTO } from "@shared/utils";
import { TripNotFoundError, UserNotFoundError } from "@shared/errors";
import type { UserRepository } from "@modules/users/repository.contract";

export interface UsecaseFindById {
  (
    tripRepository: TripRepository,
    userRepository: UserRepository,
    id: string,
  ): Promise<ResponseTripDTO>;
}

export const usecaseFindById: UsecaseFindById = async (
  tripRepository,
  userRepository,
  id,
) => {
  const trip = await tripRepository.findByPublicId(id);
  if (!trip) {
    throw new TripNotFoundError();
  }

  const userPublicId = await userRepository.findPublicId(trip.userId);
  if (!userPublicId) {
    throw new UserNotFoundError();
  }

  const responseTrip: ResponseTripDTO = buildTripResponseDTO(trip, userPublicId);
  return responseTrip;
};

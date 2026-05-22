import type { TripResponseDTO } from "@shared/dto/trip.dto";
import type { TripRepository } from "../repository.contract";
import { TripNotFoundError } from "@shared/errors";
import type { UserRepository } from "@/modules/user/repository.contract";
import type { TripWithUserPublicId } from "../repository.contract";
import { getTripResponseDTO } from "./mappers";

export interface UsecaseFindById {
  (
    tripRepository: TripRepository,
    userRepository: UserRepository,
    id: string,
  ): Promise<TripResponseDTO>;
}

interface ValidateFindById {
  (trip: TripWithUserPublicId | null): TripWithUserPublicId;
}

const validateFindById: ValidateFindById = (trip) => {
  if (!trip) {
    throw new TripNotFoundError();
  }

  return trip;
};

export const usecaseFindById: UsecaseFindById = async (
  tripRepository,
  _userRepository,
  id,
) => {
  const trip = await tripRepository.findByPublicIdWithUserPublicId(id);
  const existingTrip = validateFindById(trip);

  const responseTrip: TripResponseDTO = getTripResponseDTO(
    existingTrip,
    existingTrip.user.publicId,
  );
  return responseTrip;
};

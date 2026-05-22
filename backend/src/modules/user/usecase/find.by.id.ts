import type { UserResponseDTO } from "@shared/dto";
import type { UserRepository } from "../repository.contract";
import { getUserResponseDTO } from "./mappers";
import { UserNotFoundError } from "@shared/errors";

export interface UsecaseFindById {
  (
    userRepository: UserRepository,
    publicId: string,
  ): Promise<UserResponseDTO | null>;
}

export const usecaseFindById: UsecaseFindById = async (
  userRepository: UserRepository,
  publicId: string,
) => {
  const user = await userRepository.findByPublicId(publicId);

  if (user === null) {
    throw new UserNotFoundError();
  }
  
  const userResponse: UserResponseDTO = getUserResponseDTO(user);
  return userResponse;
};

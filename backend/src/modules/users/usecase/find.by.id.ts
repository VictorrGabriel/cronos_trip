import type { UserResponseDTO } from "@shared/dto/user.dto";
import type { UserRepository } from "../repository.contract";
import { buildUserResponseDTO } from "@/shared/dto/dto.response.builders";
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
  
  const userResponse: UserResponseDTO = buildUserResponseDTO(user)
  return userResponse;
};

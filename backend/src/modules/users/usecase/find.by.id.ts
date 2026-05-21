import { buildUserResponseDTO } from "@/shared/utils/dto.response.builders";
import type { UserRepository } from "../repository.contract";
import type { ResponseUserDTO } from "@shared/dto/user.dto";
import { UserNotFoundError } from "@shared/errors";

export interface UsecaseFindById {
  (
    userRepository: UserRepository,
    publicId: string,
  ): Promise<ResponseUserDTO | null>;
}

export const usecaseFindById: UsecaseFindById = async (
  userRepository: UserRepository,
  publicId: string,
) => {
  const user = await userRepository.findByPublicId(publicId);
  if (user === null) {
    throw new UserNotFoundError();
  }
  const userResponse: ResponseUserDTO = buildUserResponseDTO(user)
  return userResponse;
};

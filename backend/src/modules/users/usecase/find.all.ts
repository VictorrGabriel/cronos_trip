import type { UserRepository } from "../repository.contract";
import type { UserResponseDTO } from "@shared/dto";
import { buildUserResponseDTO } from "@/shared/dto";

export interface UsecaseFindAll {
  (userRepository: UserRepository): Promise<UserResponseDTO[]>;
}

export const usecaseFindAll: UsecaseFindAll = async (
  userRepository: UserRepository,
) => {
  const users = await userRepository.findAll();
  const usersResponse: UserResponseDTO[] = [];
  for (const user of users) {
    const userResponse: UserResponseDTO = buildUserResponseDTO(user, true);
    usersResponse.push(userResponse);
  }
  return usersResponse;
};

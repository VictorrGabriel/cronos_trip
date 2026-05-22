import type { UserRepository } from "../repository.contract";
import type { UserResponseDTO } from "@shared/dto";
import { getUserResponseDTO } from "./mappers";

export interface UsecaseFindAll {
  (userRepository: UserRepository): Promise<UserResponseDTO[]>;
}

export const usecaseFindAll: UsecaseFindAll = async (
  userRepository: UserRepository,
) => {
  const users = await userRepository.findAll();
  const usersResponse: UserResponseDTO[] = [];
  for (const user of users) {
    const userResponse: UserResponseDTO = getUserResponseDTO(user, true);
    usersResponse.push(userResponse);
  }
  return usersResponse;
};

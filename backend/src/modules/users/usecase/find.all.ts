import { buildUserResponseDTO } from "@/shared/utils/dto.response.builders";
import type { UserRepository } from "../repository.contract";
import type { ResponseUserDTO } from "@shared/dto/user.dto";

export interface UsecaseFindAll {
  (userRepository: UserRepository): Promise<ResponseUserDTO[]>;
}

export const usecaseFindAll: UsecaseFindAll = async (
  userRepository: UserRepository,
) => {
  const users = await userRepository.findAll();
  let usersResponse: ResponseUserDTO[] = [];
  for (const user of users) {
    const userResponse: ResponseUserDTO = buildUserResponseDTO(user, true);
    usersResponse.push(userResponse);
  }

  return usersResponse;
};

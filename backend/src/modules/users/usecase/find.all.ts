import type { UserRepository } from "../repository.contract";
import type { ResponseUserDTO } from "@shared/dto/user.dto";
import { pickByKeys } from "@shared/utils";

export interface UsecaseFindAll {
  (userRepository: UserRepository): Promise<ResponseUserDTO[]>;
}

export const usecaseFindAll: UsecaseFindAll = async (
  userRepository: UserRepository,
) => {
  const users = await userRepository.findAll();
  let usersResponse: ResponseUserDTO[] = [];
  for (const user of users) {
    usersResponse.push(
      pickByKeys({ ...user, id: user.publicId }, [
        "name",
        "email",
        "createdAt",
        "id",
      ]),
    );
  }

  return usersResponse;
};

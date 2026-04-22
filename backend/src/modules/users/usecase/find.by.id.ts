import type { UserRepository } from "../repository.contract";
import type { ResponseUserDTO } from "@shared/dto/user.dto";
import { UserNotFoundError } from "@shared/errors";
import { pickByKeys } from "@shared/utils";

export interface UsecaseFindById {
  (userRepository: UserRepository, id: bigint): Promise<ResponseUserDTO | null>;
}

export const usecaseFindById: UsecaseFindById = async (
  userRepository: UserRepository,
  id: bigint,
) => {
  const user = await userRepository.findById(id);
  if (user === null) {
    throw new UserNotFoundError();
  }
  const userResponse: ResponseUserDTO = pickByKeys(user, ["name", "email", "createdAt"]);
  return userResponse;
};

import type { UserRepository } from "../repository.contract";
import type { ResponseUserDTO } from "@shared/dto/user.dto";
import { UserNotFoundError } from "@shared/errors";
import { pickByKeys } from "@shared/utils";

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
  const userResponse: ResponseUserDTO = pickByKeys(
    { ...user, id: user.publicId },
    ["name", "email", "createdAt", "id"],
  );
  return userResponse;
};

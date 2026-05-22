import type { UserRepository } from "@/modules/user/repository.contract";
import type { AuthRepository } from "../repository.contract";
import type { AuthLogoutDTO } from "@shared/dto/auth.dto";
import { UserNotFoundError } from "@/shared/errors";
import type { User } from "@prisma/client";

interface ValidateLogout {
  (user: User | null): User;
}

const validateLogout: ValidateLogout = (user) => {
  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
};

export interface UsecaseLogout {
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    userId: string,
    data: AuthLogoutDTO,
  ): Promise<void>;
}

export const usecaseLogout: UsecaseLogout = async (
  authRepository,
  userRepository,
  userId,
  data,
) => {
  const user = await userRepository.findByPublicId(userId);
  const existingUser = validateLogout(user);

  await authRepository.revolkedByDevice(existingUser.id, data.deviceInfo);
};

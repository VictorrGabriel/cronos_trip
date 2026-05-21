import type { UserRepository } from "@modules/users/repository.contract";
import type { AuthUpdatePasswordDTO } from "@shared/dto/auth.dto";
import argon2 from "argon2";
import { UserNotFoundError, PasswordMismatchError } from "@shared/errors";
import type { User } from "@prisma/client";

interface ValidateUpdatePassword {
  (data: AuthUpdatePasswordDTO, user: User | null): Promise<User>;
}

const validateUpdatePassword: ValidateUpdatePassword = async (data, user) => {

  if (!user) {
    throw new UserNotFoundError();
  }

  const isValidPassword = await argon2.verify(
    user.passwordHash,
    data.currentPassword,
  );

  if (!isValidPassword) {
    throw new PasswordMismatchError();
  }

  return user;
};

export interface UsecaseUpdatePassword {
  (
    userRepository: UserRepository,
    userId: string,
    data: AuthUpdatePasswordDTO,
  ): Promise<void>;
}

export const usecaseUpdatePassword: UsecaseUpdatePassword = async (
  userRepository,
  userId,
  data,
) => {
  const user = await userRepository.findByPublicId(userId);
  const existingUser = await validateUpdatePassword(data, user);

  const passwordHash = await argon2.hash(data.newPassword, {
    memoryCost: 64,
    timeCost: 12,
    parallelism: 4,
  });

  await userRepository.update(existingUser.id, { passwordHash });
};

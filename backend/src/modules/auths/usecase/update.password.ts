import type { UserRepository } from "@modules/users/repository.contract";
import type { UpdatePasswordAuthDTO } from "@shared/dto/auth.dto";
import { updatePasswordSchema } from "../schemas";
import argon2 from "argon2";
import { UserNotFoundError, PasswordMismatchError } from "@shared/errors";

export interface UsecaseUpdatePassword {
  (
    userRepository: UserRepository,
    userId: string,
    data: UpdatePasswordAuthDTO,
  ): Promise<void>;
}

export const usecaseUpdatePassword: UsecaseUpdatePassword = async (
  userRepository,
  userId,
  data,
) => {
  updatePasswordSchema.parse(data);
  const user = await userRepository.findByPublicId(userId);

  if(!user){
    throw new UserNotFoundError();
  }

  const isValidPassword = await argon2.verify(user.passwordHash, data.currentPassword);

  if(!isValidPassword){
    throw new PasswordMismatchError();
  }

  const passwordHash = await argon2.hash(data.newPassword, {
    memoryCost: 64,
    timeCost: 12,
    parallelism: 4,
  });

  await userRepository.update(user.id, { passwordHash });
};

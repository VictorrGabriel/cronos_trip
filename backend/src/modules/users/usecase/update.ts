import type { UserRepository } from "../repository.contract";
import type { UpdateUserDTO } from "@shared/dto/user.dto";
import { userUpdateSchema } from "../schemas";
import { cleanByAllowedKeys } from "@shared/utils";
import { EmailConflictError } from "@shared/errors";

interface ValidateUpdate {
  (data: UserUpdateDTO, existingEmail: boolean): void;
}

export const validateUpdate: ValidateUpdate = (data, existingEmail) => {
  if (existingEmail) {
    throw new EmailConflictError();
  }
};

export interface UsecaseUpdate {
  (
    userRepository: UserRepository,
    data: UpdateUserDTO,
    publicId: string,
  ): Promise<void>;
}

export const usecaseUpdate: UsecaseUpdate = async (
  userRepository: UserRepository,
  data: UpdateUserDTO,
  publicId: string,
) => {
  const existingEmail = data.email
    ? await userRepository.existsByEmail(data.email)
    : false;

  validateUpdate(data, existingEmail);

  const entityUpdate: Prisma.UserUpdateInput = cleanByAllowedKeys(data, [
    "email",
    "name",
  ]);

  await userRepository.updateByPublicId(publicId, entityUpdate);
};

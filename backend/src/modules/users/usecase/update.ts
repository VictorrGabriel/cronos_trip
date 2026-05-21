import type { UserRepository } from "../repository.contract";
import type { UpdateUserDTO } from "@shared/dto/user.dto";
import { userUpdateSchema } from "../schemas";
import { cleanByAllowedKeys } from "@shared/utils";
import { EmailConflictError } from "@shared/errors";

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

  if (existingEmail) {
    throw new EmailConflictError({
      message: `Email ${data.email} already exists`,
    });
  }

  const entity = cleanByAllowedKeys(data, ["email", "name"]);
  await userRepository.updateByPublicId(publicId, entity);
};

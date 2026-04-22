import type { UserRepository } from "../repository.contract";
import type { UpdateUserDTO } from "@shared/dto/user.dto";
import { userUpdateSchema } from "../schemas";
import { cleanByAllowedKeys } from "@shared/utils";
import { EmailConflictError } from "@shared/errors";

export interface UsecaseUpdate{
    (
  userRepository: UserRepository,
  data: UpdateUserDTO,
  id: bigint,
): Promise<void>
}

export const usecaseUpdate: UsecaseUpdate = async (
  userRepository: UserRepository,
  data: UpdateUserDTO,
  id: bigint,
) => {
  const validatedData = userUpdateSchema.parse(data);
  const existingEmail = validatedData.email
    ? await userRepository.existsByEmail(validatedData.email)
    : false;

  if (existingEmail) {
    throw new EmailConflictError({ message: `Email ${validatedData.email} already exists` });
  }

  const entity = cleanByAllowedKeys(validatedData, ["email", "name"]);
  await userRepository.update(id, entity);
};

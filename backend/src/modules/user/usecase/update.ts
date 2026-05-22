import type { UserRepository } from "../repository.contract";
import type { UserUpdateDTO } from "@shared/dto";
import { getEntityFromUpdateDTO } from "./mappers";
import { EmailConflictError } from "@shared/errors";
import type { Prisma } from "@prisma/client";

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
    data: UserUpdateDTO,
    publicId: string,
  ): Promise<void>;
}

export const usecaseUpdate: UsecaseUpdate = async (
  userRepository: UserRepository,
  data: UserUpdateDTO,
  publicId: string,
) => {
  const existingEmail = data.email
    ? await userRepository.existsByEmail(data.email)
    : false;

  validateUpdate(data, existingEmail);

  const entityUpdate: Prisma.UserUpdateInput = getEntityFromUpdateDTO(data);

  await userRepository.updateByPublicId(publicId, entityUpdate);
};

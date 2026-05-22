import type { UserRepository } from "../repository.contract";
import type { UserResponseDTO, UserCreateDTO } from "@shared/dto";
import { getEntityFromCreateDTO, getUserResponseDTO } from "./mappers";
import { buildPublicId } from "@shared/utils";
import { EmailConflictError } from "@shared/errors";
import argon2 from "argon2";
import type { Prisma } from "@prisma/client";

interface ValidateCreate {
  (data: UserCreateDTO, existingUser: boolean): void;
}

export const validateCreate: ValidateCreate = (data, existingEmail) => {
  if (existingEmail) {
    throw new EmailConflictError();
  }
};

export interface UsecaseCreate {
  (
    userRepository: UserRepository,
    data: UserCreateDTO,
  ): Promise<UserResponseDTO>;
}

export const usecaseCreate: UsecaseCreate = async (
  userRepository: UserRepository,
  data: UserCreateDTO,
) => {
  const existingEmail = await userRepository.existsByEmail(data.email);

  validateCreate(data, existingEmail);

  const passwordHash = await argon2.hash(data.password, {
    memoryCost: 64,
    timeCost: 12,
    parallelism: 4,
  });

  const publicId = buildPublicId(data.name);

  const entityCreate: Prisma.UserCreateInput = getEntityFromCreateDTO(
    data,
    publicId,
    passwordHash,
  );

  const user = await userRepository.create(entityCreate);
  const userResponse: UserResponseDTO = getUserResponseDTO(user);

  return userResponse;
};

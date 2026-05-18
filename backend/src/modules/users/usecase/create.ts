import type { UserRepository } from "../repository.contract";
import type { UserResponseDTO, UserCreateDTO } from "@shared/dto";
import { buildUserResponseDTO } from "@shared/dto";
import { buildPublicId, pickByKeys } from "@shared/utils";
import { EmailConflictError } from "@shared/errors";
import argon2 from "argon2";
import type { Prisma } from "@prisma/client";

export interface UsecaseCreate {
  (
    userRepository: UserRepository,
    data: UserCreateDTO,
  ): Promise<UserResponseDTO>;
}

interface ValidateCreate {
  (data: UserCreateDTO, existingUser: boolean): void;
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

  const entityCreate: Prisma.UserCreateInput = pickByKeys(
    {
      ...data,
      publicId,
      passwordHash,
    },
    ["email", "name", "passwordHash", "publicId"],
  );

  const user = await userRepository.create(entityCreate);
  const userResponse: UserResponseDTO = buildUserResponseDTO(user);

  return userResponse;
};

export const validateCreate: ValidateCreate = (data, existingEmail) => {
  if (existingEmail) {
    throw new EmailConflictError();
  }
};

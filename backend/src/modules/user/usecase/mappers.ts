import type { UserCreateDTO, UserResponseDTO, UserUpdateDTO } from "@shared/dto";
import type { Prisma, User } from "@prisma/client";
import { pickByKeys, cleanByAllowedKeys } from "@shared/utils";

export const getEntityFromCreateDTO = (
  createDTO: UserCreateDTO,
  publicId: string,
  passwordHash: string,
): Prisma.UserCreateInput => {
  const baseCreate = pickByKeys(createDTO, ["email", "name"]);

  const entity: Prisma.UserCreateInput = {
    ...baseCreate,
    passwordHash,
    publicId,
  };

  return entity;
};

export const getEntityFromUpdateDTO = (
  updateDTO: UserUpdateDTO,
): Prisma.UserUpdateInput => cleanByAllowedKeys(updateDTO, ["email", "name"]);

export const getUserResponseDTO = (
  user: User,
  roleIncluded = false,
): UserResponseDTO => {
  const baseResponse = pickByKeys(user, ["name", "email", "createdAt"]);

  const response: UserResponseDTO = {
    ...baseResponse,
    id: user.publicId,
  };

  if (roleIncluded) {
    response.role = user.role;
  }

  return response;
};

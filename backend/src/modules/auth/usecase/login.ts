import type { AuthResponseDTO, AuthLoginDTO } from "@shared/dto";
import {
  pickByKeys,
  generateAccessToken,
  generateRefreshToken,
} from "@shared/utils";
import { InvalidCredentialsError } from "@shared/errors";
import type { UserRepository } from "@/modules/user/repository.contract";
import type { AuthRepository } from "../repository.contract";
import type { Prisma, User } from "@prisma/client";
import argon2 from "argon2";
import { getAuthResponseDTO, getEntityFromLoginDTO } from "./mappers";

interface ValidateLogin {
  (data: AuthLoginDTO, user: User | null): Promise<User>;
}

const validateLogin: ValidateLogin = async (data, user) => {
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const { passwordHash } = user;

  const isValidPassword = await argon2.verify(passwordHash, data.password);

  if (!isValidPassword) {
    throw new InvalidCredentialsError();
  }

  return user;
};

export interface UsecaseLogin {
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    data: AuthLoginDTO,
  ): Promise<AuthResponseDTO>;
}

export const usecaseLogin: UsecaseLogin = async (
  authRepository: AuthRepository,
  userRepository: UserRepository,
  data: AuthLoginDTO,
) => {
  const user = await userRepository.findByEmail(data.email);

  const existingUser = await validateLogin(data, user);

  await authRepository.revokeWhereIpAddressAndDevice(
    existingUser.id,
    data.ipAddress,
    data.deviceInfo,
  );

  const token = generateRefreshToken(existingUser.publicId);
  const tokenHash = await argon2.hash(token);

  const entity = getEntityFromLoginDTO(data, tokenHash, existingUser);

  const refreshToken = await authRepository.create(entity);
  const accessToken = generateAccessToken(
    existingUser.publicId,
    existingUser.role,
  );

  const authResponse: AuthResponseDTO = getAuthResponseDTO(
    refreshToken,
    token,
    accessToken,
  );

  return authResponse;
};

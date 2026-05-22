import type { AuthRefreshDTO } from "@shared/dto/auth.dto";
import type { AuthRepository } from "../repository.contract";
import argon2 from "argon2";
import {
  generateAccessToken,
  verifyRefreshToken,
} from "@shared/utils/auth.helper";
import { InvalidTokenError, UserNotFoundError } from "@shared/errors";
import type { UserRepository } from "@/modules/user/repository.contract";
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";

interface ValidateRefresh {
  (
    authRepository: AuthRepository,
    user: User | null,
    data: AuthRefreshDTO,
  ): Promise<User>;
}

const validateRefresh: ValidateRefresh = async (
  authRepository,
  user,
  data,
) => {
  if (!user) {
    throw new UserNotFoundError();
  }

  if (!data.refreshToken) {
    throw new InvalidTokenError({ message: "Missing refresh token" });
  }

  try {
    verifyRefreshToken(data.refreshToken);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      await authRepository.revokedAllByUserId(user.id);
    }
    throw err;
  }

  const refreshToken = await authRepository.findLatestUnrevoked(
    user.id,
    data.deviceInfo,
  );

  if (!refreshToken) {
    throw new InvalidTokenError({ message: "Refresh token not found" });
  }

  const isValidToken = await argon2.verify(
    refreshToken.tokenHash,
    data.refreshToken,
  );

  if (!isValidToken) {
    await authRepository.revokedAllByUserId(refreshToken.userId);
    throw new InvalidTokenError({
      message: "Invalid refresh token, all tokens have been revoked",
    });
  }

  if (refreshToken.revoked) {
    throw new InvalidTokenError({ message: "Refresh token revoked" });
  }

  return user;
};

export interface UsecaseRefresh {
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    userId: string,
    data: AuthRefreshDTO,
  ): Promise<string>;
}

export const usecaseRefresh: UsecaseRefresh = async (
  authRepository,
  userRepository,
  userId,
  data,
) => {
  const user = await userRepository.findByPublicId(userId);
  const existingUser = await validateRefresh(authRepository, user, data);

  const accessToken = generateAccessToken(
    existingUser.publicId,
    existingUser.role,
  );

  return accessToken;
};

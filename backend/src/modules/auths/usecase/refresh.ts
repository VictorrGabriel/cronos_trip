import type { ResponseAuthDTO, RefreshAuthDTO } from "@shared/dto/auth.dto";
import type { AuthRepository } from "../repository.contract";
import argon2 from "argon2";
import {
  generateAccessToken,
  verifyRefreshToken,
} from "@shared/utils/auth.helper";
import { InvalidTokenError, UserNotFoundError } from "@shared/errors";
import type { UserRepository } from "@/modules/users/repository.contract";
import jwt from "jsonwebtoken";

export interface UsecaseRefresh {
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    userId: string,
    data: RefreshAuthDTO,
  ): Promise<string>;
}

export const usecaseRefresh: UsecaseRefresh = async (
  authRepository,
  userRepository,
  userId,
  data,
) => {
    const user = await userRepository.findByPublicId(userId);
  if (!user) {
    throw new UserNotFoundError();
  }
  if (!data.refreshToken) {
    throw new InvalidTokenError({ message: "Missing refresh token" });
  }
  try {
    verifyRefreshToken(data.refreshToken);
  } catch (err) {
    if(err instanceof jwt.JsonWebTokenError){
      await authRepository.revokedAllByUserId(user.id)
    }

    throw err;
  }



  const refreshToken = await authRepository.findLatestUnrevoked(user.id, data.deviceInfo);

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

  const accessToken = generateAccessToken(String(refreshToken.userId));

  return accessToken;
};

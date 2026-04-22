import type { ResponseAuthDTO, TokenAuthDTO } from "@shared/dto/auth.dto";
import type { AuthRepository } from "../repository.contract";
import argon2 from "argon2";
import {
  generateAccessToken,
  verifyRefreshToken,
} from "@shared/utils/auth.helper";
import { InvalidTokenError } from "@shared/errors";

export interface UsecaseRefresh {
  (
    authRepository: AuthRepository,
    userRefreshToken: string,
    data: TokenAuthDTO,
  ): Promise<string>;
}

export const usecaseRefresh: UsecaseRefresh = async (
  authRepository,
  userRefreshToken,
  data,
) => {
  verifyRefreshToken(userRefreshToken);

  const refreshToken = await authRepository.findById(data.jti);
  if (!refreshToken) {
    throw new InvalidTokenError({ message: "Refresh token not found" });
  }

  const isValidToken = await argon2.verify(
    refreshToken.tokenHash,
    userRefreshToken,
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

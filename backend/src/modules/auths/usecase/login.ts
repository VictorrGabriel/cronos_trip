import type { ResponseAuthDTO, LoginAuthDTO } from "@shared/dto/auth.dto";
import type { AuthRepository } from "../repository.contract";
import type { UserRepository } from "@modules/users/repository.contract";
import { loginSchema } from "../schemas";
import argon2 from "argon2";
import { pickByKeys } from "@shared/utils";
import type { Prisma } from "@prisma/client";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@shared/utils/auth.helper";
import { InvalidCredentialsError } from "@shared/errors";

export interface UsecaseLogin {
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    data: LoginAuthDTO,
  ): Promise<ResponseAuthDTO>;
}

export const usecaseLogin: UsecaseLogin = async (
  authRepository: AuthRepository,
  userRepository: UserRepository,
  data: LoginAuthDTO,
) => {
  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const tokensUnrevokedByIpAddress =
    await authRepository.findWhereIpAddressAndDevice(
      user.id,
      data.ipAddress,
      data.deviceInfo,
    );

  for (const refreshToken of tokensUnrevokedByIpAddress) {
    await authRepository.revokedById(refreshToken.id);
  }

  const { passwordHash } = user;

  const isValidPassword = await argon2.verify(passwordHash, data.password);

  if (!isValidPassword) {
    throw new InvalidCredentialsError();
  }

  const token = generateRefreshToken(String(user.id));
  const tokenHash = await argon2.hash(token);

  const createdBase = pickByKeys(data, ["deviceInfo", "ipAddress"]);

  const entity: Prisma.RefreshTokenCreateInput = {
    ...createdBase,
    tokenHash,
    user: { connect: { id: user.id } },
  };

  const refreshToken = await authRepository.create(entity);
  const accessToken = generateAccessToken(String(user.id));

  const authResponse: ResponseAuthDTO = pickByKeys(
    { ...refreshToken, token, accessToken, jti: String(refreshToken.id) },
    ["token", "accessToken", "expiresAt", "createdAt", "jti"],
  );

  return authResponse;
};

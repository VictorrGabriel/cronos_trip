import type { AuthLoginDTO, AuthResponseDTO } from "@/shared/dto";
import type { Prisma, RefreshToken, User } from "@prisma/client";
import { pickByKeys } from "@/shared/utils";

export const getEntityFromLoginDTO = (
  loginDTO: AuthLoginDTO,
  tokenHash: string,
  user: User,
): Prisma.RefreshTokenCreateInput => {
  const createdBase = pickByKeys(loginDTO, ["deviceInfo", "ipAddress"]);

  const entity: Prisma.RefreshTokenCreateInput = {
    ...createdBase,
    tokenHash,
    user: { connect: { id: user.id } },
  };

  return entity;
};

export const getAuthResponseDTO = (
  refreshToken: RefreshToken,
  token: string,
  accessToken: string,
): AuthResponseDTO => {
  const responseDTO = pickByKeys({ ...refreshToken, token, accessToken }, [
    "token",
    "accessToken",
    "expiresAt",
    "createdAt",
  ]);

  return responseDTO;
};

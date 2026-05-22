import type {
  AuthLoginSchema,
  AuthUpdatePasswordSchema,
} from "@/modules/auth/schemas";
import type { RefreshToken } from "@prisma/client";

export type AuthLoginDTO = AuthLoginSchema & {
  ipAddress: string | null;
  deviceInfo: string | null;
};

export type AuthUpdatePasswordDTO = AuthUpdatePasswordSchema;

export type AuthLogoutDTO = Pick<RefreshToken, "deviceInfo" >;

export type AuthResponseDTO = Pick<
  RefreshToken,
  "expiresAt" | "createdAt"
> & { token: string; accessToken: string };

export type AuthRefreshDTO = Pick<RefreshToken, "deviceInfo" > & {refreshToken: string | undefined};

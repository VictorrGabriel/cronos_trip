import type {
  AuthLoginInput,
  AuthUpdatePasswordInput,
  AuthTokenInput
} from "@modules/auths/schemas";
import type { RefreshToken } from "@prisma/client";

export type LoginAuthDTO = AuthLoginInput & {
  ipAddress: string | null;
  deviceInfo: string | null;
};

export type UpdatePasswordAuthDTO = AuthUpdatePasswordInput;

export type TokenAuthDTO = AuthTokenInput;

export type ResponseAuthDTO = Pick<
  RefreshToken,
  "expiresAt" | "createdAt"
> & { token: string; accessToken: string; jti: string };

import { generateAccessToken, verifyAccessToken } from "../utils";
import type { RefreshToken } from "@prisma/client";

export const makeAccessToken = (userId: string, role: string = "USER") => generateAccessToken(userId, role);

export const checkAccessToken = (token: string) => verifyAccessToken(token);

export const makeRefreshTokenRecord = (overrides: Partial<RefreshToken> = {}): RefreshToken => ({
  id: 1n,
  tokenHash: "hashed-refresh-token",
  revoked: false,
  deviceInfo: "Mozilla/5.0",
  ipAddress: "127.0.0.1",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  userId: 1n,
  ...overrides,
});
import jwt from "jsonwebtoken";
import { InvalidTokenError } from "@shared/errors";

interface MyTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const generateRefreshToken = (userId: string): string => {
  const refreshKey = process.env.JWT_REFRESH_KEY;
  if (typeof refreshKey !== "string" || refreshKey.trim() === "") {
    throw new InvalidTokenError({ message: "Invalid refresh key" });
  }
  const refreshToken = jwt.sign(
    { userId },
    refreshKey,
    { expiresIn: "7d" },
  );

  return refreshToken;
};

export const verifyRefreshToken = (token: string) => {
  const refreshKey = process.env.JWT_REFRESH_KEY;
  if (typeof refreshKey !== "string" || refreshKey.trim() === "") {
    throw new InvalidTokenError({ message: "Invalid refresh key" });
  }

  const decoded = jwt.verify(token, refreshKey) as MyTokenPayload;
  return decoded.userId
};

export const generateAccessToken = (userId: string) => {
    const accessKey = process.env.JWT_ACCESS_KEY;
  if (typeof accessKey !== "string" || accessKey.trim() === "") {
    throw new InvalidTokenError({ message: "Invalid access key" });
  }
  const accessToken = jwt.sign(
    { userId },
    accessKey,
    { expiresIn: "15m" },
  );

  return accessToken;
};

export const verifyAccessToken = (token: string) => {
    const accessKey = process.env.JWT_ACCESS_KEY;
  if (typeof accessKey !== "string" || accessKey.trim() === "") {
    throw new InvalidTokenError({ message: "Invalid access key" });
  }

  const decoded = jwt.verify(token, accessKey) as MyTokenPayload;
  return decoded.userId
};


import jwt from "jsonwebtoken";
import { AppError } from "@shared/errors";

type TokenPayload = {
  userId: string;
  role: string;
} & jwt.JwtPayload;

export const generateRefreshToken = (userId: string): string => {
  const refreshKey = process.env.JWT_REFRESH_KEY;
  if (typeof refreshKey !== "string" || refreshKey.trim() === "") {
    throw new AppError({ message: "Invalid refresh key" });
  }
  const refreshToken = jwt.sign({ userId }, refreshKey, { expiresIn: "7d" });

  return refreshToken;
};

export const verifyRefreshToken = (token: string) => {
  const refreshKey = process.env.JWT_REFRESH_KEY;
  if (typeof refreshKey !== "string" || refreshKey.trim() === "") {
    throw new AppError({ message: "Invalid refresh key" });
  }

  const decoded = jwt.verify(token, refreshKey) as TokenPayload;
  return decoded;
};

export const generateAccessToken = (userId: string, role: string) => {
  const accessKey = process.env.JWT_ACCESS_KEY;
  if (typeof accessKey !== "string" || accessKey.trim() === "") {
    throw new AppError({ message: "Invalid access key" });
  }

  const accessToken = jwt.sign({ userId, role }, accessKey, {
    expiresIn: "15m",
  });

  return accessToken;
};

export const verifyAccessToken = (token: string) => {
  const accessKey = process.env.JWT_ACCESS_KEY;
  if (typeof accessKey !== "string" || accessKey.trim() === "") {
    throw new AppError({ message: "Invalid access key" });
  }

  const decoded = jwt.verify(token, accessKey) as TokenPayload;
  return decoded;
};

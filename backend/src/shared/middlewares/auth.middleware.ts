import type { HttpRequest, HttpResponse } from "@shared/types";
import type { NextFunction } from "express";
import { verifyAccessToken } from "@shared/utils/auth.helper";
import { InvalidTokenError } from "@shared/errors";
import { AuthorizationError } from "../errors/authorization.error";

export const auth = (
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new InvalidTokenError({
      message: "Missing or malformed authorization header",
    });
  }
  const token = authHeader.split(" ")[1];
  if (typeof token !== "string") {
    throw new InvalidTokenError();
  }
  const decodedToken = verifyAccessToken(token);
  req.params.userIdByToken = decodedToken.userId;

  next();
};

export const adminAuth = (
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new InvalidTokenError({
      message: "Missing or malformed authorization header",
    });
  }
  const token = authHeader.split(" ")[1];
  if (typeof token !== "string") {
    throw new InvalidTokenError();
  }

  const decodedToken = verifyAccessToken(token);
  if (decodedToken.role.toUpperCase() !== "ADMIN") {
    throw new AuthorizationError();
  }

  req.params.userIdByToken = decodedToken.userId;

  next();
};

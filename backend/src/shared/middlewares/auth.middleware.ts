import type { HttpRequest, HttpResponse } from "@shared/types";
import type { NextFunction } from "express";
import { verifyAccessToken } from "@shared/utils/auth.helper";
import { InvalidTokenError } from "@shared/errors";

export const auth = (
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction,
): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new InvalidTokenError({ message: "Missing or malformed authorization header" });
    }
    const token = authHeader.split(" ")[1];
    if (typeof token !== "string") {
        throw new InvalidTokenError();
    }
    const userId = verifyAccessToken(token);
    req.params.userId = userId;
    next();
};

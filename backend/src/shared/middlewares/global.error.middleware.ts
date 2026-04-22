import type { HttpResponse, HttpRequest } from "@shared/types";
import type { NextFunction } from "express";
import { AppError, ConflictError, NotFoundError } from "@shared/errors";
import { Prisma } from "@prisma/client";
import { string } from "zod";

export const globalErrorHandler = (
  err: Error,
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction,
) => {
  console.error(err);
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, code: err.code });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const errorMapping: PrismaErrorMap = {
      P2002: new ConflictError({ message: "Existing record", cause: err }),
      P2025: new NotFoundError({ message: "Record not found", cause: err }),
    };

    const target =
      errorMapping[err.code] ||
      new AppError({
        message: "Bad request",
        cause: err,
        code: "BAD_REQUEST",
        statusCode: 400,
      });

    return res.status(target.statusCode).json({
      message: target.message,
      code: err.code,
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res
      .status(400)
      .json({ message: "Invalid data schema" });
  }
  
  res.status(500).json({ message: "Internal Server Error" });
};

type PrismaErrorMap = Record<string, AppError>;

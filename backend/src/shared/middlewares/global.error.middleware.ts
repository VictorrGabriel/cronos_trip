import type { HttpResponse, HttpRequest } from "@shared/types";
import type { NextFunction } from "express";
import {
  AppError,
  ConflictError,
  ConflictTripDate,
  NotFoundError,
} from "@shared/errors";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

const handleTokenErrors = (err: Error, errorResponse: ErrorResponse) => {
  const statusCode = 401;
  if (err instanceof jwt.TokenExpiredError) {
    errorResponse.statusCode = statusCode;
    errorResponse.json = {
      message: "Token expired",
    };
    return;
  }

  if (err instanceof jwt.JsonWebTokenError) {
    errorResponse.statusCode = statusCode;
    errorResponse.json = {
      message: "Invalid Token: " + err.message,
    };
    return;
  }
};

const handlePrismaErrors = (err: Error, errorResponse: ErrorResponse) => {
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

    errorResponse.statusCode = target.statusCode;
    errorResponse.json = {
      message: target.message,
      code: err.code,
    };
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse.statusCode = 400;
    errorResponse.json = { message: "Invalid data schema" };
    return;
  }
};

const handlerConflictDatesError = (
  err: Error,
  errorResponse: ErrorResponse,
) => {
  if (err instanceof ConflictTripDate) {
    errorResponse.statusCode = err.statusCode;
    errorResponse.json = {
      message: err.message,
      conflict: err.dateList,
      code: err.code,
    };
    return;
  }
};

const handleAppErrors = (err: Error, errorResponse: ErrorResponse) => {
  if (err instanceof AppError) {
    errorResponse.statusCode = err.statusCode;
    errorResponse.json = { message: err.message };
    handlerConflictDatesError(err, errorResponse);
    return;
  }
};

export const globalErrorHandler = (
  err: Error,
  req: HttpRequest,
  res: HttpResponse,
  next: NextFunction,
) => {
  console.error(err);
  const errorResponse: ErrorResponse = {
    statusCode: 500,
    json: { message: "Internal Server Error" },
  };

  handleAppErrors(err, errorResponse);

  handlePrismaErrors(err, errorResponse);

  handleTokenErrors(err, errorResponse);

  res.status(errorResponse.statusCode).json(errorResponse.json);
};

type PrismaErrorMap = Record<string, AppError>;
type ErrorResponse = {
  statusCode: number;
  json: Record<string, unknown> | unknown[];
};

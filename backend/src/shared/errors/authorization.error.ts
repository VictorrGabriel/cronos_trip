import { AppError } from "./app.error";

export class AuthorizationError extends AppError {
  constructor({
    message = "Access denied",
    cause,
    statusCode = 403,
    code = "AUTHORIZATION_ERROR",
  }: AuthorizationErrorOptions = {}) {
    super({
      message,
      cause,
      code,
      statusCode,
      isOperational: true,
    });
  }
}

type AuthorizationErrorOptions = {
  message?: string;
  cause?: unknown;
  code?: string;
  statusCode?: number;
};

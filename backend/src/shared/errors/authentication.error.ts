import { AppError } from "./app.error";

export class AuthenticationError extends AppError {
  constructor({ message, cause, code = "AUTHENTICATION_ERROR" }: AuthenticationErrorOptions) {
    super({ message, cause, code, statusCode: 401, isOperational: true });
  }
}

type AuthenticationErrorOptions = {
  message: string;
  cause?: unknown;
  code?: string;
};

import { AppError } from "./app.error";

export class ValidationError extends AppError {
  constructor({ message, cause, code = "VALIDATION_ERROR" }: ValidationErrorOptions) {
    super({ message, cause, code, statusCode: 400, isOperational: true });
  }
}

type ValidationErrorOptions = {
  message: string;
  cause?: unknown;
  code?: string;
};

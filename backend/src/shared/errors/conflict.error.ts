import { AppError } from "./app.error";

export class ConflictError extends AppError {
  constructor({ message, cause, code = "CONFLICT" }: ConflictErrorOptions) {
    super({ message, cause, code, statusCode: 409, isOperational: true });
  }
}

type ConflictErrorOptions = {
  message: string;
  cause?: unknown;
  code?: string;
};

import { AppError } from "./app.error";

export class NotFoundError extends AppError {
  constructor({ message, cause, code = "NOT_FOUND" }: NotFoundErrorOptions) {
    super({ message, cause, code, statusCode: 404, isOperational: true });
  }
}

type NotFoundErrorOptions = {
  message: string;
  cause?: unknown;
  code?: string;
};

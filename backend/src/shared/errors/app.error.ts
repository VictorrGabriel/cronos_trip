export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor({
    message,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    cause,
    isOperational = true,
  }: AppErrorOptions) {
    super(message, { cause });
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Important for proper instanceof checks in some TS/JS targets
    Object.setPrototypeOf(this, new.target.prototype);

    // Keeps stack cleaner (Node.js)
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export type AppErrorOptions = {
  message: string;
  statusCode?: number;
  code?: string;
  cause?: unknown;
  isOperational?: boolean;
};

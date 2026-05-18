import { ConflictError } from "./conflict.error";

export class EmailConflictError extends ConflictError {
  constructor({ message = "Email already exists", cause }: EmailConflictOptions = {}) {
    super({ message, cause, code: "EMAIL_CONFLICT" });
  }
}

type EmailConflictOptions = {
  message?: string;
  cause?: unknown;
};

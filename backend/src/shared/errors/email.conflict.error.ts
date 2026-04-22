import { ConflictError } from "./conflict.error";

export class EmailConflictError extends ConflictError {
  constructor({ message, cause }: EmailConflictOptions) {
    super({ message, cause, code: "EMAIL_CONFLICT" });
  }
}

type EmailConflictOptions = {
  message: string;
  cause?: unknown;
};

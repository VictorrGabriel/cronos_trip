import { AuthenticationError } from "./authentication.error";

export class PasswordMismatchError extends AuthenticationError {
  constructor({ message = "Current password is incorrect", cause }: PasswordMismatchErrorOptions = {}) {
    super({ message, cause, code: "PASSWORD_MISMATCH" });
  }
}

type PasswordMismatchErrorOptions = {
  message?: string;
  cause?: unknown;
};

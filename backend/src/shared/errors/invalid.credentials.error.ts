import { AuthenticationError } from "./authentication.error";

export class InvalidCredentialsError extends AuthenticationError {
  constructor({ message = "Invalid credentials", cause }: InvalidCredentialsErrorOptions = {}) {
    super({ message, cause, code: "INVALID_CREDENTIALS" });
  }
}

type InvalidCredentialsErrorOptions = {
  message?: string;
  cause?: unknown;
};

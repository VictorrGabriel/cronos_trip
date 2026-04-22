import { AuthenticationError } from "./authentication.error";

export class InvalidTokenError extends AuthenticationError {
  constructor({ message = "Invalid token", cause }: InvalidTokenErrorOptions = {}) {
    super({ message, cause, code: "INVALID_TOKEN" });
  }
}

type InvalidTokenErrorOptions = {
  message?: string;
  cause?: unknown;
};

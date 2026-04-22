import { ValidationError } from "./validation.error";

export class InvalidIdError extends ValidationError {
  constructor({ message = "Invalid id", cause }: InvalidIdErrorOptions = {}) {
    super({ message, cause, code: "INVALID_ID" });
  }
}

type InvalidIdErrorOptions = {
  message?: string;
  cause?: unknown;
};

import { ValidationError } from "./validation.error";

export class InvalidInputError extends ValidationError {
  constructor({ message, cause }: InvalidInputErrorOptions) {
    super({ message, cause, code: "INVALID_INPUT" });
  }
}

type InvalidInputErrorOptions = {
  message: string;
  cause?: unknown;
};

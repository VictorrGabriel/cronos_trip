import { ValidationError } from "./validation.error";

export class InvalidTripStatusError extends ValidationError {
  constructor({ message, cause }: InvalidTripStatusErrorOptions) {
    super({ message, cause, code: "INVALID_TRIP_STATUS" });
  }
}

type InvalidTripStatusErrorOptions = {
  message: string;
  cause?: unknown;
};

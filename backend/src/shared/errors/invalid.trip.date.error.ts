import { ValidationError } from "./validation.error";

export class InvalidTripDateError extends ValidationError {
  constructor({ message, cause }: InvalidTripDateErrorOptions) {
    super({ message, cause, code: "INVALID_TRIP_DATE" });
  }
}

type InvalidTripDateErrorOptions = {
  message: string;
  cause?: unknown;
};

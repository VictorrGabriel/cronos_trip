import { NotFoundError } from "./not.found.error";

export class TripNotFoundError extends NotFoundError {
  constructor({ message = "Trip not found", cause }: TripNotFoundErrorOptions = {}) {
    super({ message, cause, code: "TRIP_NOT_FOUND" });
  }
}

type TripNotFoundErrorOptions = {
  message?: string;
  cause?: unknown;
};

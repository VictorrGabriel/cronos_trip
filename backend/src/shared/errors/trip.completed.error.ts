import { AppError } from "./app.error";

export class TripCompletedError extends AppError {
  constructor({ message = "Trip is already completed and cannot be updated", cause }: TripCompletedErrorOptions = {}) {
    super({ message, cause, code: "TRIP_ALREADY_COMPLETED", statusCode: 422, isOperational: true });
  }
}

type TripCompletedErrorOptions = {
  message?: string;
  cause?: unknown;
};

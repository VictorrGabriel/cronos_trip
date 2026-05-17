import { NotFoundError } from "./not.found.error";

export class ItineraryNotFoundError extends NotFoundError {
  constructor({ message = "Itinerary not found", cause }: ItineraryNotFoundOptions = {}) {
    super({ message, cause, code: "ITINERARY_NOT_FOUND" });
  }
}

type ItineraryNotFoundOptions = {
  message?: string;
  cause?: unknown;
};

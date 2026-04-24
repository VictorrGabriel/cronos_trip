import type { TripDates } from "@shared/types/trip.type";
import { ConflictError } from "./conflict.error";

export class ConflictTripDate extends ConflictError {
    public readonly dateList: Record<string, string>[]
  constructor({ message, cause, dateList }: ConflictTripOptions) {
    super({ message, cause, code: "TRIP_DATE_CONFLICT" });
    this.dateList = dateList;
  }
}

type ConflictTripOptions = {
  message: string;
  dateList: Record<string, string>[];
  cause?: unknown;
};
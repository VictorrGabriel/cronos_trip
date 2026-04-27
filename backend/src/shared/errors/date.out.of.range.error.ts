import { ConflictError } from "./conflict.error";

export class DateOutOfRengeError extends ConflictError {
  constructor({ message, cause }: DateOutOfRengeOptions) {
    super({ message, cause, code: "DAY_OUT_OF_RANGE_CONFLICT" });
  }
}

type DateOutOfRengeOptions = {
  message: string;
  cause?: unknown;
};

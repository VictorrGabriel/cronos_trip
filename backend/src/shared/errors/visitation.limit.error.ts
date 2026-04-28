import { ConflictError } from "./conflict.error";

export class ConflictVisitationLimit extends ConflictError {
  constructor({ message, cause }: ConflictVisitationLimitOptions) {
    super({ message, cause, code: "VISITATION_LIMIT_CONFLICT" });
  }
}

type ConflictVisitationLimitOptions = {
  message: string;
  cause?: unknown;
};
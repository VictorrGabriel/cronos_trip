import { NotFoundError } from "./not.found.error";

export class VisitationNotFoundError extends NotFoundError {
  constructor({ message = "Visitation not found", cause }: VisitationNotFoundOptions = {}) {
    super({ message, cause, code: "VISITATION_NOT_FOUND" });
  }
}

type VisitationNotFoundOptions = {
  message?: string;
  cause?: unknown;
};

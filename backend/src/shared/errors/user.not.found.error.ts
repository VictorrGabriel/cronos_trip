import { NotFoundError } from "./not.found.error";

export class UserNotFoundError extends NotFoundError {
  constructor({ message = "User not found", cause }: UserNotFoundOptions = {}) {
    super({ message, cause, code: "USER_NOT_FOUND" });
  }
}

type UserNotFoundOptions = {
  message?: string;
  cause?: unknown;
};

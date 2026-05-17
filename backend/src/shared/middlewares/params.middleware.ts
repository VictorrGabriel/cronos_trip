import type { HttpRequest, HttpResponse } from "@shared/types";
import type { NextFunction } from "express";
import { InvalidIdError } from "@shared/errors";

export const validateIdParam =
  (idField: string = "id") =>
  (req: HttpRequest, res: HttpResponse, next: NextFunction): void => {
    const id = req.params[idField];

    if (typeof id !== "string" || id.trim() === "") {
      throw new InvalidIdError({ message: "Id must be a non-empty string" });
    }

    if (id.length < 11) {
      throw new InvalidIdError({ message: "Invalid id format" });
    }

    next();
  };

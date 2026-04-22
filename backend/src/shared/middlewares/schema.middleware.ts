import type { HttpRequest, HttpResponse } from "@shared/types";
import type { NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { ValidationError } from "@shared/errors";

export const validateSchema =
  (schema: ZodSchema) =>
   (req: HttpRequest, res: HttpResponse, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ValidationError({ message: err.issues[0]?.message || "Invalid data schema", cause: err });
      }
      throw err;
    }
  };

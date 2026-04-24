import type { HttpRequest, HttpResponse } from "@shared/types";
import type { NextFunction } from "express";
import { type ZodObject, ZodError } from "zod";
import { ValidationError } from "@shared/errors";

export const validateSchema =
  (schema: ZodObject) =>
   (req: HttpRequest, res: HttpResponse, next: NextFunction): void => {
    try {
      const validBody = schema.parse(req.body);
      req.body = validBody;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw new ValidationError({ message: err.issues[0]?.message || "Invalid data schema", cause: err });
      }
      throw err;
    }
  };

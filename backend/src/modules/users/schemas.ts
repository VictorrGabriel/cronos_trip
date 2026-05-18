import * as z from "zod";
import { capitalizeFirstLetter } from "@/shared/utils";

const userNameSchema = z
  .string({ error: "User name must be a non-empty string" })
  .min(3, { error: "User name must have at least 3 characters" })
  .max(20, "User name must have less than 20 characters")
  .transform((input) => capitalizeFirstLetter(input));

const userEmailSchema = z
  .email({ error: "invalid email format" })
  .max(256, "Email must have less than 256 character");

const userPasswordSchema = z
  .string({ error: "Password must be a non-empty string" })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
    "Password must be between 8 and 32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
  );

const hasAtLeastOneDefinedField = (data: Record<string, unknown>): boolean =>
  Object.values(data).some((value) => value !== undefined);

export const userCreateSchema = z
  .object({
    name: userNameSchema,
    email: userEmailSchema,
    password: userPasswordSchema,
  })
  .strict();

export const userUpdateSchema = z
  .object({
    name: userNameSchema.optional(),
    email: userEmailSchema.optional(),
  })
  .refine(hasAtLeastOneDefinedField, {
    message: "At least one field must be provided for update",
  })
  .strict();

export type UserCreateSchema = z.infer<typeof userCreateSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

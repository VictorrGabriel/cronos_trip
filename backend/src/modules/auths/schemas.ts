import * as z from "zod";

const userEmailSchema = z
  .email({ error: "Invalid email format" })
  .max(256, "Email must have less than 256 character");

const getUserPasswordSchema = (password = "Password") =>
  z
    .string({ error: `${password} must be a non-empty string` })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
      `${password} must be between 8 and 32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character`,
    );

const jwiSchema = z.preprocess(
  (input) => {
    if (typeof input === "string" && input.length < 20) {
      return BigInt(input);
    }

    return input;
  },
  z.bigint({ error: "JWI must be bigint convertable " }),
);

export const loginSchema = z.object({
  email: userEmailSchema,
  password: getUserPasswordSchema(),
}).strict();

export const updatePasswordSchema = z.object({
  newPassword: getUserPasswordSchema("New password"),
  currentPassword: getUserPasswordSchema("Current Password"),
}).strict();

export const tokenSchema = z.object({
  jti: jwiSchema,
}).strict();

export type AuthLoginInput = z.infer<typeof loginSchema>;
export type AuthUpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type AuthTokenInput = z.infer<typeof tokenSchema>;

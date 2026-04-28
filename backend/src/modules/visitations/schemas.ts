import * as z from "zod";

const visitationPriceCentsSchema = z
  .number({ error: "Price cents must be a non-negative integer" })
  .int({ error: "Price cents must be a non-negative integer" })
  .min(0, "Price cents must be greater or equal to 0");

const visitaionVisitOrderSchema = z
  .number({ error: "Visit order must be a non-negative integer" })
  .int({ error: "Visit order must be a non-negative integer" })
  .min(0, { error: "Visit order must be greater or equal to 0" })
  .max(10, { error: "Visit order must be less or equal to 10" })
  .nullable();
const isValidScheduleTime = (input: string | null): boolean => {
  const regex = /^\d{2}:\d{2}$/;
  return input === null || regex.test(input);
};
const visitationScheduleTimeSchema = z
  .string({ error: "Schedule time must be a non-empty string or null" })
  .nullable()
  .refine(isValidScheduleTime, {
    error: "Schedule time must be in format '00:00' or null",
  });

const visitationDurationMinutesSchema = z
  .number({ error: "Visit order must be a non-negative integer" })
  .int({ error: "Visit order must be a non-negative integer" })
  .max(86400, { error: "Visit order must be less or equal to 86400" })
  .min(0, { error: "Visit order must greater or equal to 0" })
  .nullable();

const visitationIsVisitedSchema = z.boolean({
  error: "Is visited must be an boolean",
});

const hasAtLeastOneDefinedField = (data: Record<string, unknown>): boolean =>
  Object.values(data).some((value) => value !== undefined);

export const visitationCreateSchema = z
  .object({
    priceCents: visitationPriceCentsSchema,
    visitOrder: visitaionVisitOrderSchema,
    scheduleTime: visitationScheduleTimeSchema,
    durationMinutes: visitationDurationMinutesSchema,
    isVisited: visitationIsVisitedSchema,
  })
  .strict();

export const visitationUpdateSchema = z
  .object({
    priceCents: visitationPriceCentsSchema.optional(),
    visitOrder: visitaionVisitOrderSchema.optional(),
    scheduleTime: visitationScheduleTimeSchema.optional(),
    durationMinutes: visitationDurationMinutesSchema.optional(),
    isVisited: visitationIsVisitedSchema.optional(),
  })
  .refine(hasAtLeastOneDefinedField, {
    error: "At least one field must be provided",
  })
  .strict();

export type VisitationCreateInput = z.infer<typeof visitationCreateSchema>;
export type VisitationUpdateInput = z.infer<typeof visitationUpdateSchema>;
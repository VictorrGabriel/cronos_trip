import * as z from "zod";
import { capitalizeFirstLetter } from "@/shared/utils";

const tripNameSchema = z
  .string({ error: "Name must be a non-empty string" })
  .min(3, "Name must have at least 3 characters")
  .max(20, "Trip name must have at most 20 characters")
  .transform((input) => capitalizeFirstLetter(input));


const buildTripDateSchema = (fieldName: string) =>
  z.coerce
    .date({ error: `${fieldName} must be a date` })

const tripTimezoneSchema = z
  .string({ error: "Timezone must be a string" })
  .refine(
    (input) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: input });
        return true;
      } catch {
        return false;
      }
    },
    { error: "Invalid timezone format" },
  )
  .max(64, "Timezone must have at most 64 characters");

const tripStatusSchema = z
  .string({ error: "Status must be a string" })
  .transform((input) => {
    const formattedStatus = input.toUpperCase();
    return formattedStatus;
  });

const tripBudgetCentsSchema = z
  .number({ error: "Budget cents must be a non-negative integer" })
  .int({ error: "Budget cents must be a non-negative integer" })
  .nonnegative({ error: "Budget cents must be a non-negative integer" });

const hasAtLeastOneDefinedField = (data: Record<string, unknown>): boolean =>
  Object.values(data).some((value) => value !== undefined);

const hasTimezoneForDate = (data: Record<string, unknown>): boolean =>
  !data.startDate && !data.endDate ? true : Boolean(data.timezone);

export const tripCreateSchema = z.object({
  name: tripNameSchema,
  startDate: buildTripDateSchema("Start date"),
  endDate: buildTripDateSchema("End date"),
  timezone: tripTimezoneSchema,
  status: tripStatusSchema,
  budgetCents: tripBudgetCentsSchema,
}).strict();

export const tripUpdateSchema = z
  .object({
    name: tripNameSchema.optional(),
    startDate: buildTripDateSchema("Start date").optional(),
    endDate: buildTripDateSchema("End date").optional(),
    timezone: tripTimezoneSchema.optional(),
    status: tripStatusSchema.optional(),
    budgetCents: tripBudgetCentsSchema.optional(),
  })
  .refine(hasAtLeastOneDefinedField, {
    error: "At least one field must be provided",
  })
  .refine(hasTimezoneForDate, {
    error: "Timezone must be provided when any date is present",
  }).strict();

export type TripCreateInput = z.infer<typeof tripCreateSchema>;
export type TripUpdateInput = z.infer<typeof tripUpdateSchema>;

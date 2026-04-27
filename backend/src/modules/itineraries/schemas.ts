import * as z from "zod";

const itineraryDayDateSchema = z.coerce.date({
  error: "Day date must be a date",
});

const itineraryDailyQuotaSchema = z
  .number({ error: "Daily quota must be a non-negative integer" })
  .int({ error: "Daily quota must be a non-negative integer" })
  .min(0, { error: "Daily quota must be greater or equal to 0" })
  .max(10, { error: "Daily quota must be less or equal to 10" });

const itineraryTotalEstimateCentsSchema = z
  .number({ error: "Total estimate cents must be a non-negative integer" })
  .int({ error: "Total estimate cents must be a non-negative integer" })
  .min(0, { error: "Total estimate cents must be greater or equal to 0" });

const itineraryPlaceApiRefSchema = z
  .string({ error: "API reference must be a non-empty string" })
  .nonempty({ error: "API refrence must be a non-empty string" })
  .max(72, { error: "API reference must have less than 72 characters" });

const itineraryNotesSchema = z
  .string({ error: "Notes must be a string" })
  .max(300, { error: "Notes must have less than 300 characters" });

const itineraryStatusSchema = z
  .string({ error: "Status must be a string" })
  .transform((input) => {
    const formattedStatus = input.toUpperCase();
    return formattedStatus;
  });

const hasAtLeastOneDefinedField = (data: Record<string, unknown>): boolean =>
  Object.values(data).some((value) => value !== undefined);

export const itineraryCreateSchema = z
  .object({
    dayDate: itineraryDayDateSchema,
    dailyQuota: itineraryDailyQuotaSchema,
    totalEstimateCents: itineraryTotalEstimateCentsSchema,
    placeApiRef: itineraryPlaceApiRefSchema,
    notes: itineraryNotesSchema,
    status: itineraryStatusSchema,
  })
  .strict();

export const itineraryUpdateSchema = z
  .object({
    dayDate: itineraryDayDateSchema.optional(),
    dailyQuota: itineraryDailyQuotaSchema.optional(),
    totalEstimateCents: itineraryTotalEstimateCentsSchema.optional(),
    placeApiRef: itineraryPlaceApiRefSchema.optional(),
    notes: itineraryNotesSchema.optional(),
    status: itineraryStatusSchema.optional(),
  })
  .refine(hasAtLeastOneDefinedField, {
    error: "At least one field must be provided",
  })
  .strict();

export type ItineraryCreateInput = z.infer<typeof itineraryCreateSchema>;
export type ItineraryUpdateInput = z.infer<typeof itineraryUpdateSchema>;

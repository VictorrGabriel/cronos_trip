import type { TripCreateInput, TripUpdateInput } from "@modules/trips/schemas";
import type { Trip } from "@prisma/client";

export type CreateTripDTO = TripCreateInput & {userId: string};

export type UpdateTripDTO = TripUpdateInput;

export type ResponseTripDTO = Omit<Trip, "userId" | "id" | "publicId" > & {id: string, userId: string};
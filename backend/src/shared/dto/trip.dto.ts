import type { TripCreateInput, TripUpdateInput } from "@modules/trips/schemas";
import type { Trip } from "@prisma/client";

export type CreateTripDTO = TripCreateInput & {userId: bigint};

export type UpdateTripDTO = TripUpdateInput;

export type ResponseTripDTO = Omit<Trip, "userId" | "id" > & {id: string};
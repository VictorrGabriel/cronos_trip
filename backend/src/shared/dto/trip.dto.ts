import type { TripCreateInput, TripUpdateInput } from "@modules/trips/schemas";
import type { Trip } from "@prisma/client";

export type TripCreateDTO = TripCreateInput & { userId: string };

export type TripUpdateDTO = TripUpdateInput;

export type TripResponseDTO = Omit<Trip, "userId" | "id" | "publicId"> & {
  id: string;
  userId: string;
};

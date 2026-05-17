import type { Itinerary, Prisma } from "@prisma/client";
import type { BaseRepository } from "@shared/repositories";

export interface ItineraryRepository extends BaseRepository<Itinerary> {
  create(data: Prisma.ItineraryCreateInput): Promise<Itinerary>;
  update(
    ItineraryId: bigint,
    data: Prisma.ItineraryUpdateInput,
  ): Promise<Itinerary>;
  findByTripId(tripId: bigint): Promise<Itinerary[]>;
  findByTripPublicId(tripId: string): Promise<Itinerary[]>;
  isFreeDay(tripId: bigint, day: Date): Promise<boolean>;
}

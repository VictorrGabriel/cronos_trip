import type { Itinerary, Prisma } from "@prisma/client";
import type { BaseRepository } from "@shared/repositories";

export type ItineraryWithTripPublicId = Prisma.ItineraryGetPayload<{
  include: { trip: { select: { publicId: true } } };
}>;

export interface ItineraryRepository extends BaseRepository<Itinerary> {
  create(data: Prisma.ItineraryCreateInput): Promise<Itinerary>;
  update(
    ItineraryId: bigint,
    data: Prisma.ItineraryUpdateInput,
  ): Promise<Itinerary>;
  findByTripId(tripId: bigint): Promise<Itinerary[]>;
  findByTripPublicId(tripId: string): Promise<Itinerary[]>;
  findByPublicIdWithTripPublicId(
    publicId: string,
  ): Promise<ItineraryWithTripPublicId | null>;
  isFreeDay(tripId: bigint, day: Date): Promise<boolean>;
}

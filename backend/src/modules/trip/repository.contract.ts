import type { Prisma, Trip } from "@prisma/client";
import type { BaseRepository } from "@shared/repositories";
import type { TripDates } from "@shared/types/trip.type";

export type TripWithUserPublicId = Prisma.TripGetPayload<{
  include: { user: { select: { publicId: true } } };
}>;

export interface TripRepository extends BaseRepository<Trip> {
  create(data: Prisma.TripCreateInput): Promise<Trip>;
  update(id: bigint, data: Prisma.TripUpdateInput): Promise<Trip>;
  findByUserId(userId: bigint): Promise<Trip[]>;
  findByUserPublicId(userId: string): Promise<Trip[]>;
  findByPublicIdWithUserPublicId(publicId: string): Promise<TripWithUserPublicId | null>;
  findConflictDate(
    userId: bigint,
    startDate: Date,
    endDate: Date,
    excludeId?: bigint,
  ): Promise<TripDates[]>;
}

import type { Prisma, Trip } from "@prisma/client";
import type { BaseRepository } from "@shared/repositories";
import type { TripDates } from "@shared/types/trip.type";

export interface TripRepository extends BaseRepository<Trip> {
  create(data: Prisma.TripCreateInput): Promise<Trip>;
  update(id: bigint, data: Prisma.TripUpdateInput): Promise<Trip>;
  findByUserId(userId: bigint): Promise<Trip[]>;
  findConflictDate(userId: bigint, startDate: Date, endDate: Date): Promise<TripDates[]>;
}

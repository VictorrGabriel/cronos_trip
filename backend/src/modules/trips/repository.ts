import { BaseRepositoryImpl } from "@shared/repositories";
import { PrismaClient, Prisma, type Trip } from "@prisma/client";
import type { TripRepository } from "./repository.contract";
import type { TripDates } from "@shared/types/trip.type";

export class TripRepositoryImpl
  extends BaseRepositoryImpl<Trip>
  implements TripRepository
{
  protected readonly model = this.prisma.trip;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: Prisma.TripCreateInput): Promise<Trip> {
    return await this.model.create({ data });
  }

  async update(id: bigint, data: Prisma.TripUpdateInput): Promise<Trip> {
    return await this.model.update({ data, where: { id } });
  }

  async findByUserId(userId: bigint): Promise<Trip[]> {
    return await this.model.findMany({ where: { user: { id: userId } } });
  }

 async findByUserPublicId(userId: string): Promise<Trip[]> {
     return await this.model.findMany({ where: { user: { publicId: userId } } });
  }

  async findConflictDate(
    userId: bigint,
    newStartDate: Date,
    newEndDate: Date,
    excludeId?: bigint,
  ): Promise<TripDates[]> {
    const whereClause: Prisma.TripWhereInput = {
      userId,
      startDate: { lte: newEndDate },
      endDate: { gte: newStartDate },
    };

    if (excludeId !== undefined) {
      Object.assign(whereClause, { NOT: { id: excludeId } });
    }

    return this.model.findMany({
      select: { startDate: true, endDate: true },
      where: whereClause,
    });
  }
}



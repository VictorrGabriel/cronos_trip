import { BaseRepositoryImpl } from "@shared/repositories";
import type { ItineraryRepository } from "./repository.contract";
import { type Itinerary, Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client/extension";
import type { ItineraryDayDates } from "@shared/types/itinerary.type";

export class ItineraryRepositoryImpl
  extends BaseRepositoryImpl<Itinerary>
  implements ItineraryRepository
{
  protected readonly model = this.prisma.itinerary;
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: Prisma.ItineraryCreateInput): Promise<Itinerary> {

    return await this.prisma.$transaction(async (tx) => {
      return await tx.itinerary.create({ data });
    });
  }

  async update(
    ItineraryId: bigint,
    data: Prisma.ItineraryUpdateInput,
  ): Promise<Itinerary> {
    return await this.prisma.$transaction(async (tx) => {
      return await tx.itinerary.update({ data, where: { id: ItineraryId } });
    });
  }

  async findByTripId(tripId: bigint): Promise<Itinerary[]> {
    return await this.model.findMany({ where: { tripId } });
  }

async findByTripPublicId(tripId: string): Promise<Itinerary[]> {
  return await this.model.findMany({where: {trip: {publicId: tripId}}})
}


  async isFreeDay(tripId: bigint, day: Date): Promise<boolean> {
    return (
      (await this.model.findFirst({
        select: { dayDate: true },
        where: { tripId, dayDate: day },
      })) === null
    );
  }
}

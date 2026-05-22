import { BaseRepositoryImpl } from "@shared/repositories";
import type {
  ItineraryRepository,
  ItineraryWithTripPublicId,
} from "./repository.contract";
import { type Itinerary, Prisma, type PrismaClient } from "@prisma/client";

export class ItineraryRepositoryImpl
  extends BaseRepositoryImpl<Itinerary>
  implements ItineraryRepository
{
  protected readonly model = this.prisma.itinerary;
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: Prisma.ItineraryCreateInput): Promise<Itinerary> {
    return await this.model.create({ data });
  }

  async update(
    ItineraryId: bigint,
    data: Prisma.ItineraryUpdateInput,
  ): Promise<Itinerary> {
    return await this.model.update({ data, where: { id: ItineraryId } });
  }

  async findByTripId(tripId: bigint): Promise<Itinerary[]> {
    return await this.model.findMany({ where: { tripId } });
  }

  async findByTripPublicId(tripId: string): Promise<Itinerary[]> {
    return await this.model.findMany({ where: { trip: { publicId: tripId } } });
  }

  async findByPublicIdWithTripPublicId(
    publicId: string,
  ): Promise<ItineraryWithTripPublicId | null> {
    return await this.model.findUnique({
      include: { trip: { select: { publicId: true } } },
      where: { publicId },
    });
  }

  async isFreeDay(tripId: bigint, day: Date): Promise<boolean> {
    return (
      (await this.model.findUnique({
        select: { id: true },
        where: { tripId_dayDate: { tripId, dayDate: day } },
      })) === null
    );
  }
}

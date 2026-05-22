import { BaseRepositoryImpl } from "@shared/repositories";
import type {
  VisitationRepository,
  VisitationWithItineraryPublicId,
} from "./repository.contract";
import type { Prisma, Visitation, PrismaClient } from "@prisma/client";

export class VisitationRepositoryImpl
  extends BaseRepositoryImpl<Visitation>
  implements VisitationRepository
{
  protected readonly model = this.prisma.visitation;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
  async create(data: Prisma.VisitationCreateInput): Promise<Visitation> {
    return await this.model.create({ data });
  }

  async update(
    id: bigint,
    data: Prisma.VisitationUpdateInput,
  ): Promise<Visitation> {
    return await this.model.update({ data, where: { id } });
  }

  async isFreeOrder(itineraryId: bigint, order: number): Promise<boolean> {
    return (
      (await this.model.findUnique({
        select: { id: true },
        where: { itineraryId_visitOrder: { itineraryId, visitOrder: order } },
      })) === null
    );
  }

  async minutesSum(itineraryId: bigint): Promise<number | null> {
    const aggregate = await this.model.aggregate({
      _sum: { durationMinutes: true },
      where: { itineraryId },
    });
    return aggregate._sum.durationMinutes;
  }

  async findVisitationTotalByItineraryId(itineraryId: bigint): Promise<number> {
    return await this.model.count({ where: { itineraryId } });
  }

  async findByItineraryId(itineraryId: bigint): Promise<Visitation[]> {
    return await this.model.findMany({ where: { itineraryId } });
  }

  async findByItineraryPublicId(itineraryId: string): Promise<Visitation[]> {
    return await this.model.findMany({
      where: { itinerary: { publicId: itineraryId } },
    });
  }

  async findByPublicIdWithItineraryPublicId(
    publicId: string,
  ): Promise<VisitationWithItineraryPublicId | null> {
    return await this.model.findUnique({
      include: { itinerary: { select: { publicId: true } } },
      where: { publicId },
    });
  }
}

// select sum(durationMinutes) from visitation where itineraryId = itineraryId grouopBy durationMinutes;

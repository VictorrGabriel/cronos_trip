import type { Prisma, Visitation } from "@prisma/client";
import type { BaseRepository } from "@shared/repositories";

export type VisitationWithItineraryPublicId = Prisma.VisitationGetPayload<{
  include: { itinerary: { select: { publicId: true } } };
}>;

export interface VisitationRepository extends BaseRepository<Visitation> {
  create(data: Prisma.VisitationCreateInput): Promise<Visitation>;
  update(id: bigint, data: Prisma.VisitationUpdateInput): Promise<Visitation>;
  isFreeOrder(itineraryId: bigint, order: number): Promise<boolean>;
  minutesSum(itineraryId: bigint): Promise<number | null>;
  findVisitationTotalByItineraryId(itineraryId: bigint): Promise<number>;
  findByItineraryId(itineraryId: bigint): Promise<Visitation[]>;
  findByItineraryPublicId(itineraryId: string): Promise<Visitation[]>;
  findByPublicIdWithItineraryPublicId(
    publicId: string,
  ): Promise<VisitationWithItineraryPublicId | null>;
}

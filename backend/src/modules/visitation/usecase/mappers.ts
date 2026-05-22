import type {
  VisitationCreateDTO,
  VisitationResponseDTO,
  VisitationUpdateDTO,
} from "@shared/dto";
import type { Prisma, Visitation } from "@prisma/client";
import { pickByKeys, cleanByAllowedKeys } from "@shared/utils";

export const getEntityFromCreateDTO = (
  createDTO: VisitationCreateDTO,
  publicId: string,
  itineraryId: bigint,
): Prisma.VisitationCreateInput => {
  const baseCreate = pickByKeys(createDTO, [
    "durationMinutes",
    "isVisited",
    "priceCents",
    "scheduleTime",
    "visitOrder",
  ]);

  const entity: Prisma.VisitationCreateInput = {
    ...baseCreate,
    publicId,
    itinerary: { connect: { id: itineraryId } },
  };

  return entity;
};

export const getEntityFromUpdateDTO = (
  updateDTO: VisitationUpdateDTO,
): Prisma.VisitationUpdateInput =>
  cleanByAllowedKeys(updateDTO, [
    "durationMinutes",
    "isVisited",
    "priceCents",
    "scheduleTime",
    "visitOrder",
  ]);

export const getVisitationResponseDTO = (
  visitation: Visitation,
  itineraryId: string,
): VisitationResponseDTO => {
  const baseResponse = pickByKeys(visitation, [
    "durationMinutes",
    "isVisited",
    "priceCents",
    "scheduleTime",
    "visitOrder",
    "createdAt",
  ]);

  const response: VisitationResponseDTO = {
    ...baseResponse,
    id: visitation.publicId,
    itineraryId,
  };

  return response;
};

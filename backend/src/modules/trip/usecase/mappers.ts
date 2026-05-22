import type {
  TripCreateDTO,
  TripResponseDTO,
  TripUpdateDTO,
} from "@/shared/dto";
import type { Prisma, ProgressStatus, User, Trip } from "@prisma/client";
import { pickByKeys, cleanByAllowedKeys } from "@/shared/utils";

export const getEntityFromCreateDTO = (
  createDTO: TripCreateDTO,
  publicId: string,
  user: User,
): Prisma.TripCreateInput => {
  const baseCreate = pickByKeys(createDTO, [
    "name",
    "startDate",
    "endDate",
    "budgetCents",
    "status",
  ]);

  const entity: Prisma.TripCreateInput = {
    ...baseCreate,
    status: createDTO.status as ProgressStatus,
    publicId,
    user: { connect: { id: user.id } },
  };

  return entity;
};

export const getEntityFromUpdateDTO = (
  updateDTO: TripUpdateDTO,
): Prisma.TripUpdateInput => {
  const updateSource = {
    name: updateDTO.name,
    startDate: updateDTO.startDate,
    endDate: updateDTO.endDate,
    budgetCents: updateDTO.budgetCents,
    status:
      updateDTO.status !== undefined
        ? (updateDTO.status as ProgressStatus)
        : undefined,
  };

  const entity: Prisma.TripUpdateInput = cleanByAllowedKeys(
    updateSource,
    [
    "name",
    "startDate",
    "endDate",
    "budgetCents",
    "status",
  ],
  );

  return entity;
};

export const getTripResponseDTO = (
  trip: Trip,
  userId: string,
): TripResponseDTO => {
  const BaseReponseDTO = pickByKeys({ ...trip }, [
    "id",
    "userId",
    "name",
    "startDate",
    "endDate",
    "status",
    "budgetCents",
    "createdAt",
  ]);

  const tripResponse: TripResponseDTO = {
    ...BaseReponseDTO,
    id: trip.publicId,
    userId,
  };

  return tripResponse;
};

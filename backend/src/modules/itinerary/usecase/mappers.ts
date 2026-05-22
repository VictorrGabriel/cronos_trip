import type {
  ItineraryCreateDTO,
  ItineraryResponseDTO,
  ItineraryUpdateDTO,
} from "@/shared/dto";
import type { Itinerary, Prisma, Trip } from "@prisma/client";
import { pickByKeys, cleanByAllowedKeys } from "@/shared/utils";
import type { ItineraryWithTripPublicId } from "../repository.contract";

export const getEntityFromCreateDTO = (
  createDTO: ItineraryCreateDTO,
  publicId: string,
  trip: Trip,
): Prisma.ItineraryCreateInput => {
  const baseCreate = pickByKeys(createDTO, [
    "dailyQuota",
    "dayDate",
    "notes",
    "placeApiRef",
    "totalEstimateCents",
  ]);

  const entity: Prisma.ItineraryCreateInput = {
    ...baseCreate,
    publicId,
    trip: { connect: { id: trip.id } },
  };

  return entity;
};

export const getEntityFromUpdateDTO = (
  updateDTO: ItineraryUpdateDTO,
  trip: Trip
): Prisma.ItineraryUpdateInput => {
  const baseCreateItinerary = cleanByAllowedKeys(updateDTO, [
    "dailyQuota",
    "dayDate",
    "notes",
    "placeApiRef",
    "totalEstimateCents",
  ]);

  const itineraryEntity: Prisma.ItineraryUpdateInput = {
    ...baseCreateItinerary,
    trip: { connect: { id: trip.id} },
  };

  return itineraryEntity;
};

export const getItineraryResponseDTO = (
  itinerary: Itinerary,
  tripId: string,
): ItineraryResponseDTO => {
  const BaseReponseDTO = pickByKeys({ ...itinerary }, [
    "dayDate",
    "dailyQuota",
    "totalEstimateCents",
    "placeApiRef",
    "notes",
    "status",
    "createdAt",
  ]);

  const itineraryResponse: ItineraryResponseDTO = {
    ...BaseReponseDTO,
    id: itinerary.publicId,
    tripId,
  };

  return itineraryResponse;
};

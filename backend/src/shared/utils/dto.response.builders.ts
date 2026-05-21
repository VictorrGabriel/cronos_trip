import type { Itinerary, Trip, User, Visitation } from "@prisma/client";
import type {
  ItineraryResponseDTO,
  TripResponseDTO,
  VisitationResponseDTO,
  ResponseUserDTO
} from "@shared/dto";
import { pickByKeys } from "./object.helper";

export const buildItineraryResponseDTO = (
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

export const buildTripResponseDTO = (
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

export const buildVisitationResponseDTO = (
  visitation: Visitation,
  itineraryId: string,
): VisitationResponseDTO => {
  const baseResponseDTO = pickByKeys(visitation, [
    "durationMinutes",
    "isVisited",
    "priceCents",
    "scheduleTime",
    "visitOrder",
    "createdAt",
  ]);

  const visitationResponse: VisitationResponseDTO = {
    ...baseResponseDTO,
    id: visitation.publicId,
    itineraryId,
  };

  return visitationResponse;
};

export const buildUserResponseDTO = (user: User, roleInicluded: boolean = false): ResponseUserDTO => {
  const baseResponseDTO = pickByKeys(user, [
    "name",
    "email", 
    "createdAt"
  ]);
  
  const userResponse: ResponseUserDTO = {
    ...baseResponseDTO,
    id: user.publicId,
  }

  roleInicluded && (userResponse.role = user.role);

  return userResponse;
}

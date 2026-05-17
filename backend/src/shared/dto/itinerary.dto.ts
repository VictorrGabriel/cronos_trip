import type {
  ItineraryCreateInput,
  ItineraryUpdateInput,
} from "@modules/itineraries/schemas";
import type { Itinerary } from "@prisma/client";

export type ItineraryCreateDTO = ItineraryCreateInput & { tripId: string };

export type ItineraryUpdateDTO = ItineraryUpdateInput & { tripId: string };

export type ItineraryResponseDTO = Omit<
  Itinerary,
  "userId" | "id" | "tripId" | "publicId"
> & { id: string; tripId: string };

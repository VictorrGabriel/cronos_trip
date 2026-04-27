import type {
  ItineraryCreateInput,
  ItineraryUpdateInput,
} from "@modules/itineraries/schemas";
import type { Itinerary } from "@prisma/client";

export type ItineraryCreateDTO = ItineraryCreateInput & { tripId: bigint };

export type ItineraryUpdateDTO = ItineraryUpdateInput & { tripId: bigint };

export type ItineraryResponseDTO = Omit<
  Itinerary,
  "userId" | "id" | "tripId"
> & { id: string; tripId: string };

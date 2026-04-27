import type { HttpRequest, HttpResponse } from "@shared/types";
import type { ItineraryRepository } from "./repository.contract";
import type { TripRepository } from "@modules/trips/repository.contract";
import type {
  UsecaseCreate,
  UsecaseDelete,
  UsecaseFindAllByTripId,
  UsecaseFindById,
  UsecaseUpdate,
} from "./usecase";
import type {
  ItineraryCreateDTO,
  ItineraryUpdateDTO,
} from "@shared/dto/itinerary.dto";
import type { ItineraryCreateInput, ItineraryUpdateInput } from "./schemas";

export const controllerCreate =
  (
    itineraryRepository: ItineraryRepository,
    tripRepository: TripRepository,
    itineraryCreate: UsecaseCreate,
  ) =>
  async (req: HttpRequest, res: HttpResponse) => {
    const tripId = BigInt(req.params.tripId as string);
    const itineraryDTO: ItineraryCreateDTO = {
      ...(req.body as ItineraryCreateInput),
      tripId,
    };

    const itinerary = await itineraryCreate(
      itineraryRepository,
      tripRepository,
      itineraryDTO,
    );
    res.status(200).json(itinerary);
  };

export const controllerFindAllByTripId =
  (
    itineraryRepository: ItineraryRepository,
    itineraryFindAllByTripId: UsecaseFindAllByTripId,
  ) =>
  async (req: HttpRequest, res: HttpResponse) => {
    const tripId = BigInt(req.params.tripId as string);
    const itineraries = await itineraryFindAllByTripId(
      itineraryRepository,
      tripId,
    );
    res.status(200).json(itineraries);
  };

export const controllerFindById =
  (
    itineraryRepository: ItineraryRepository,
    itineraryFindById: UsecaseFindById,
  ) =>
  async (req: HttpRequest, res: HttpResponse) => {
    const id = BigInt(req.params.id as string);
    const itinerary = await itineraryFindById(itineraryRepository, id);
    res.status(200).json(itinerary);
  };

export const controllerUpdate =
  (
    itineraryRepository: ItineraryRepository,
    tripRepository: TripRepository,
    itineraryUpdate: UsecaseUpdate,
  ) =>
  async (req: HttpRequest, res: HttpResponse) => {
    const id = BigInt(req.params.id as string);
    const tripId = BigInt(req.params.tripId as string);
    const itineraryDTO: ItineraryUpdateDTO = {
      ...(req.body as ItineraryUpdateInput),
      tripId,
    };

    const itinerary = await itineraryUpdate(
      itineraryRepository,
      tripRepository,
      id,
      itineraryDTO,
    );
    res.status(201).json({ message: "itinerary updated successfully" });
  };

export const controllerDelete =
  (itineraryRepository: ItineraryRepository, itineraryDelete: UsecaseDelete) =>
  async (req: HttpRequest, res: HttpResponse) => {
    const id = BigInt(req.params.id as string);
    await itineraryDelete(itineraryRepository, id);
    res.status(201).json({ message: "itinerary deleted successfully" });
  };

import type {
  UsecaseCreate,
  UsecaseDelete,
  UsecaseFindById,
  UsecaseFindByUserId,
  UsecaseUpdate,
} from "./usecase/index";
import type { TripRepository } from "./repository.contract";
import type { HttpResponse, HttpRequest } from "@shared/types";
import type { CreateTripDTO, UpdateTripDTO } from "@shared/dto/trip.dto";
import type { UserRepository } from "@modules/users/repository.contract";

export const ControllerFindByUserId =
  (tripRepository: TripRepository, findByUserId: UsecaseFindByUserId) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userId = req.params.userId as string;
    const trips = await findByUserId(tripRepository, userId);
    res.status(200).json(trips);
  };

export const ControllerFindById =
  (tripRepository: TripRepository, userRepository: UserRepository, findById: UsecaseFindById) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const id = req.params.id as string;
    const trip = await findById(tripRepository, userRepository, id);
    res.status(200).json(trip);
  };

export const ControllerCreate =
  (
    tripRepository: TripRepository,
    userRepository: UserRepository,
    createTrip: UsecaseCreate,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userId = req.params.userId as string;
    const requestData = req.body as Omit<CreateTripDTO, "userId">;
    const trip = await createTrip(tripRepository, userRepository, {
      ...requestData,
      userId,
    });
    res.status(200).json(trip);
  };
export const ControllerUpdate =
  (tripRepository: TripRepository, updateTrip: UsecaseUpdate) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const data = req.body as UpdateTripDTO;

    const id = req.params.id as string;
    await updateTrip(tripRepository, data, id);
    res.status(201).json({ message: "Trip updated successfully" });
  };
export const ControllerDelete =
  (tripRepository: TripRepository, deleteTripById: UsecaseDelete) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const id = req.params.id as string;
    await deleteTripById(tripRepository, id);
    res.status(201).json({ message: "Trip deleted successfully" });
  };

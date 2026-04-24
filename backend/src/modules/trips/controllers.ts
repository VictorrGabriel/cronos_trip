import type {
  UseCaseCreate,
  UseCaseDelete,
  UseCaseFindById,
  UseCaseFindByUserId,
  UseCaseUpdate,
} from "./usecase/index";
import type { TripRepository } from "./repository.contract";
import type { HttpResponse, HttpRequest } from "@shared/types";
import type { CreateTripDTO, UpdateTripDTO } from "@shared/dto/trip.dto";
import type { UserRepository } from "@modules/users/repository.contract";

export const ControllerFindByUserId =
  (tripRepository: TripRepository, findByUserId: UseCaseFindByUserId) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userId: bigint = BigInt(req.params.userId as string);
    const trips = await findByUserId(tripRepository, userId);
    res.status(200).json(trips);
  };

export const ControllerFindById =
  (tripRepository: TripRepository, findById: UseCaseFindById) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const id: bigint = BigInt(req.params.id as string);
    const trip = await findById(tripRepository, id);
    res.status(200).json(trip);
  };

export const ControllerCreate =
  (
    tripRepository: TripRepository,
    userRepository: UserRepository,
    createTrip: UseCaseCreate,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userId = BigInt(req.params.userId as string);
    console.log(req.body.startDate)
    const requestData = req.body as Omit<CreateTripDTO, "userId">;
    const trip = await createTrip(tripRepository, userRepository, {
      ...requestData,
      userId,
    });
    res.status(200).json(trip);
  };
export const ControllerUpdate =
  (tripRepository: TripRepository, updateTrip: UseCaseUpdate) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const data = req.body as UpdateTripDTO;

    const id: bigint = BigInt(req.params.id as string);
    await updateTrip(tripRepository, data, id);
    res.status(201).json({ message: "Trip updated successfully" });
  };
export const ControllerDelete =
  (tripRepository: TripRepository, deleteTripById: UseCaseDelete) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const id: bigint = BigInt(req.params.id as string);
    await deleteTripById(tripRepository, id);
    res.status(201).json({ message: "Trip deleted successfully" });
  };

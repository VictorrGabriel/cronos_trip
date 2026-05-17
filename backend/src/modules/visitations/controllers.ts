import type { HttpRequest, HttpResponse } from "@shared/types";
import type { VisitationRepository } from "./repository.contract";
import type { ItineraryRepository } from "@modules/itineraries/repository.contract";
import type {
  UsecaseCreate,
  UsecaseDelete,
  UsecaseFindAllByItineraryId,
  UsecaseFindById,
  UsecaseUpdate,
} from "./usecase";
import type {
  VisitationCreateDTO,
  VisitationUpdateDTO,
} from "@shared/dto/visitation.dto";
import type { VisitationCreateInput, VisitationUpdateInput } from "./schemas";

export const controllerCreate =
  (
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    visitationCreate: UsecaseCreate,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const itineraryId = req.params.itineraryId as string;
    const data: VisitationCreateDTO = {
      ...(req.body as VisitationCreateInput),
      itineraryId,
    };
    const visitation = await visitationCreate(
      visitationRepository,
      itineraryRepository,
      data,
    );

    res.status(200).json(visitation);
  };

export const controllerUpdate =
  (
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    visitationUpdade: UsecaseUpdate,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const visitationId = req.params.id as string;
    const data = req.body as VisitationUpdateDTO
    await visitationUpdade(
      visitationRepository,
      itineraryRepository,
      visitationId,
      data,
    );

    res.status(201).json({ message: "Visitation updated successfully" });
  };

export const controllerFindById =
   (
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    visitationFindById: UsecaseFindById,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const id = req.params.id as string;
    const visitation = await visitationFindById(visitationRepository, itineraryRepository, id);
    res.status(200).json(visitation);
  };

export const controllerFindAllByItineraryId =
(
    visitationRepository: VisitationRepository,
    itineraryRepository: ItineraryRepository,
    visitationFindAllByItineraryId: UsecaseFindAllByItineraryId,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const itineraryId = req.params.itineraryId as string;
    const visitations = await visitationFindAllByItineraryId(
      visitationRepository,
      itineraryRepository,
      itineraryId,
    );
    res.status(200).json(visitations);
  };

export const controllerDelete =
   (
    visitationRepository: VisitationRepository,
    visitationDelete: UsecaseDelete,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const id = req.params.id as string;
    await visitationDelete(visitationRepository, id);
    res.status(201).json({ message: "Visitation deleted successfully" });
  };

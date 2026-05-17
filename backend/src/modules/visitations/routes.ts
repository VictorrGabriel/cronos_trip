import { prisma } from "@lib/prisma";
import { ItineraryRepositoryImpl } from "@modules/itineraries/repository";
import { Router } from "express";
import { VisitationRepositoryImpl } from "./repository";
import { auth, validateIdParam, validateSchema } from "@shared/middlewares/";
import { visitationCreateSchema, visitationUpdateSchema } from "./schemas";
import {
  controllerCreate,
  controllerDelete,
  controllerFindAllByItineraryId,
  controllerFindById,
  controllerUpdate,
} from "./controllers";
import {
  usecaseCreate,
  usecaseDelete,
  usecaseFindAllByItineraryId,
  usecaseFindById,
  usecaseUpdate,
} from "./usecase";
const router = Router();

const visitationRepository = new VisitationRepositoryImpl(prisma);
const itineraryRepository = new ItineraryRepositoryImpl(prisma);

router.post(
  "/:itineraryId",
  auth,
  validateIdParam("itineraryId"),
  validateSchema(visitationCreateSchema),
  controllerCreate(visitationRepository, itineraryRepository, usecaseCreate),
);

router.patch(
  "/:id",
  auth,
  validateIdParam(),
  validateSchema(visitationUpdateSchema),
  controllerUpdate(visitationRepository, itineraryRepository, usecaseUpdate),
);

router.get(
  "/itinerary/:itineraryId",
  auth,
  validateIdParam("itineraryId"),
  controllerFindAllByItineraryId(
    visitationRepository,
    itineraryRepository,
    usecaseFindAllByItineraryId,
  ),
);

router.get(
  "/:id",
  auth,
  validateIdParam(),
  controllerFindById(
    visitationRepository,
    itineraryRepository,
    usecaseFindById,
  ),
);

router.delete(
  "/:id",
  auth,
  validateIdParam(),
  controllerDelete(visitationRepository, usecaseDelete),
);

export { router as visitationRouter };

import { Router } from "express";
import {
  controllerCreate,
  controllerDelete,
  controllerFindAllByTripId,
  controllerFindById,
  controllerUpdate,
} from "./controllers";
import {
  usecaseCreate,
  usecaseDelete,
  usecaseFindAllByTripId,
  usecaseFindById,
  usecaseUpdate,
} from "./usecase/index";
import {
  auth,
  validateIdParam,
  validateSchema,
} from "@shared/middlewares/index";
import { ItineraryRepositoryImpl } from "./repository";
import { prisma } from "@lib/prisma";
import { TripRepositoryImpl } from "@modules/trips/repository";
import { itineraryCreateSchema, itineraryUpdateSchema } from "./schemas";
//import type {} from "./repository.contract";

const itinerariesRepository = new ItineraryRepositoryImpl(prisma);
const tripRepository = new TripRepositoryImpl(prisma);

const router = Router();

router.post(
  "/:tripId",
  auth,
  validateIdParam("tripId"),
  validateSchema(itineraryCreateSchema),
  controllerCreate(itinerariesRepository, tripRepository, usecaseCreate),
);

router.get(
  "/:id",
  auth,
  validateIdParam(),
  controllerFindById(itinerariesRepository, usecaseFindById),
);

router.get(
  "/trip/:tripId",
  auth,
  validateIdParam("tripId"),
  controllerFindAllByTripId(itinerariesRepository, usecaseFindAllByTripId),
);

router.patch(
  "/:tripId/:id",
  auth,
  validateIdParam("tripId"),
  validateIdParam(),
  validateSchema(itineraryUpdateSchema),
  controllerUpdate(itinerariesRepository, tripRepository, usecaseUpdate),
);

router.delete(
  "/:id",
  auth,
  validateIdParam(),
  controllerDelete(itinerariesRepository, usecaseDelete),
);

export { router as itineraryRouter };

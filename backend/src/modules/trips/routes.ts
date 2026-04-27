import { Router } from "express";
import {
  ControllerFindByUserId,
  ControllerFindById,
  ControllerCreate,
  ControllerUpdate,
  ControllerDelete,
} from "./controllers";
import {
  useCaseCreate,
  useCaseDelete,
  useCaseFindById,
  useCaseFindByUserId,
  useCaseUpdate,
} from "./usecase/index";
import { prisma } from "@lib/prisma";
import type { TripRepository } from "./repository.contract";
import { TripRepositoryImpl } from "./repository";
import type { UserRepository } from "@modules/users/repository.contract";
import { UserRepositoryImpl } from "@modules/users/repository";
import {
  validateIdParam,
  validateSchema,
  auth,
} from "@shared/middlewares/index";
import { tripCreateSchema, tripUpdateSchema } from "./schemas";

const router = Router();
const tripRepository: TripRepository = new TripRepositoryImpl(prisma);
const userRepository: UserRepository = new UserRepositoryImpl(prisma);

router.get(
  "/user/",
  auth,
  ControllerFindByUserId(tripRepository, useCaseFindByUserId),
);
router.get(
  "/:id",
  auth,
  validateIdParam(),
  ControllerFindById(tripRepository, useCaseFindById),
);
router.post(
  "/",
  auth,
  validateSchema(tripCreateSchema),
  ControllerCreate(tripRepository, userRepository, useCaseCreate),
);
router.patch(
  "/:id",
  auth, validateSchema(tripUpdateSchema),
  ControllerUpdate(tripRepository, useCaseUpdate),
);
router.delete("/:id", auth, ControllerDelete(tripRepository, useCaseDelete));

export { router as tripRouter };

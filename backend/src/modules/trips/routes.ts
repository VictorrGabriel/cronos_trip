import { Router } from "express";
import {
  ControllerFindByUserId,
  ControllerFindById,
  ControllerCreate,
  ControllerUpdate,
  ControllerDelete,
} from "./controllers";
import {
  usecaseCreate,
  usecaseDelete,
  usecaseFindById,
  usecaseFindByUserId,
  usecaseUpdate,
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
  "/user/:userId",
  auth,
  validateIdParam("userId"),
  ControllerFindByUserId(tripRepository, usecaseFindByUserId),
);
router.get(
  "/:id",
  auth,
  validateIdParam(),
  ControllerFindById(tripRepository, userRepository, usecaseFindById),
);
router.post(
  "/:userId",
  auth,
  validateSchema(tripCreateSchema),
  ControllerCreate(tripRepository, userRepository, usecaseCreate),
);
router.patch(
  "/:id",
  auth, validateSchema(tripUpdateSchema),
  ControllerUpdate(tripRepository, usecaseUpdate),
);
router.delete("/:id", auth, ControllerDelete(tripRepository, usecaseDelete));

export { router as tripRouter };

import {
  controllerFindAll,
  controllerCreate,
  controllerDelete,
  controllerFindById,
  controllerUpdate,
} from "./controllers";
import { Router } from "express";
import type { UserRepository } from "./repository.contract";
import {
  usecaseCreate,
  usecaseDelete,
  usecaseFindAll,
  usecaseFindById,
  usecaseUpdate,
} from "./usecase";
import { UserRepositoryImpl } from "./repository";
import { prisma } from "@lib/prisma";
import { validateSchema, auth, validateIdParam } from "@shared/middlewares/index";
import { userCreateSchema, userUpdateSchema } from "./schemas";

const userRouter = Router();

const userRepository: UserRepository = new UserRepositoryImpl(prisma);

userRouter.get("/", controllerFindAll(userRepository, usecaseFindAll));
userRouter.get("/:id", auth, validateIdParam(), controllerFindById(userRepository, usecaseFindById));
userRouter.post(
  "/",
  validateSchema(userCreateSchema),
  controllerCreate(userRepository, usecaseCreate),
);
userRouter.patch(
  "/:id",
  auth, validateIdParam(), validateSchema(userUpdateSchema),
  controllerUpdate(userRepository, usecaseUpdate),
);
userRouter.delete("/:id", auth, validateIdParam(), controllerDelete(userRepository, usecaseDelete));

export { userRouter };

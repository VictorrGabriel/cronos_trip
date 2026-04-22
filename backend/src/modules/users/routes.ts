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
import { validateSchema, auth } from "@shared/middlewares/index";
import { userCreateSchema, userUpdateSchema } from "./schemas";

const userRouter = Router();

const userRepository: UserRepository = new UserRepositoryImpl(prisma);

userRouter.get("/", controllerFindAll(userRepository, usecaseFindAll));
userRouter.get("/one", auth, controllerFindById(userRepository, usecaseFindById));
userRouter.post(
  "/",
  validateSchema(userCreateSchema),
  controllerCreate(userRepository, usecaseCreate),
);
userRouter.patch(
  "/",
  auth, validateSchema(userUpdateSchema),
  controllerUpdate(userRepository, usecaseUpdate),
);
userRouter.delete("/", auth, controllerDelete(userRepository, usecaseDelete));

export { userRouter };

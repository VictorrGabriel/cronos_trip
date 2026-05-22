import { Router } from "express";
import { loginSchema, tokenSchema, updatePasswordSchema } from "./schemas";
import {
  validateSchema,
  auth,
  validateIdParam,
} from "@shared/middlewares/index";
import {
  usecaseLogout,
  usecaseLogin,
  usecaseUpdatePassword,
  usecaseRefresh,
} from "./usecase/index";
import {
  controllerLogout,
  controllerLogin,
  controllerUpdatePassword,
  controllerRefresh,
} from "./controllers";
import type { AuthRepository } from "./repository.contract";
import { AuthRepositoryImpl } from "./repository";
import type { UserRepository } from "@/modules/user/repository.contract";
import { UserRepositoryImpl } from "@/modules/user/repository";
import { prisma } from "@lib/prisma";

const router = Router();
const authRepository: AuthRepository = new AuthRepositoryImpl(prisma);
const userRepository: UserRepository = new UserRepositoryImpl(prisma);

router.delete(
  "/logout/:userId",
  auth,
  validateIdParam("userId"),
  controllerLogout(authRepository, userRepository, usecaseLogout),
);

router.post(
  "/login",
  validateSchema(loginSchema),
  controllerLogin(authRepository, userRepository, usecaseLogin),
);
router.patch(
  "/user/password/:userId",
  auth,
  validateIdParam("userId"),
  validateSchema(updatePasswordSchema),
  controllerUpdatePassword(userRepository, usecaseUpdatePassword),
);
router.get(
  "/refresh/:userId",
  validateIdParam("userId"),
  controllerRefresh(authRepository, userRepository, usecaseRefresh),
);

export { router as authRouter };

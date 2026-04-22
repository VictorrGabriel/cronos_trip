import { Router } from "express";
import { loginSchema, tokenSchema, updatePasswordSchema } from "./schemas";
import { validateSchema, auth, validateIdParams } from "@shared/middlewares/index";
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
import type { UserRepository } from "@modules/users/repository.contract";
import { UserRepositoryImpl } from "@modules/users/repository";
import { prisma } from "@lib/prisma";

const router = Router();
const authRepository: AuthRepository = new AuthRepositoryImpl(prisma);
const userRepository: UserRepository = new UserRepositoryImpl(prisma);

router.post("/logout", auth, validateSchema(tokenSchema), controllerLogout(authRepository, usecaseLogout));

router.post(
  "/login",
  validateSchema(loginSchema),
  controllerLogin(authRepository, userRepository, usecaseLogin),
);
router.patch(
  "/user/password",
  auth,
  validateSchema(updatePasswordSchema),
  controllerUpdatePassword(userRepository, usecaseUpdatePassword),
);
router.post(
  "/refresh", validateSchema(tokenSchema), 
  controllerRefresh(authRepository, usecaseRefresh),
);

export { router as authRouter };

import type { AuthRepository } from "./repository.contract";
import type { HttpResponse, HttpRequest } from "@shared/types";
import type {
  AuthUpdatePasswordDTO,
  AuthLoginDTO,
  AuthRefreshDTO,
  AuthLogoutDTO,
} from "@shared/dto/index";
import type { AuthLoginSchema } from "./schemas";
import type { UserRepository } from "@/modules/user/repository.contract";
import type {
  UsecaseRefresh,
  UsecaseLogin,
  UsecaseLogout,
  UsecaseUpdatePassword,
} from "./usecase/index";

export const controllerLogin =
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    login: UsecaseLogin,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const ipAddress = req.ip ?? null;
    const deviceInfo = req.headers["user-agent"] ?? null;
    const data: AuthLoginDTO = {
      ...(req.body as AuthLoginSchema),
      ipAddress,
      deviceInfo,
    };
   // console.log(`email: ${data.email}, password: ${data.password}`);
    const refreshToken = await login(authRepository, userRepository, data);

    res.cookie("refreshToken", refreshToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: refreshToken.expiresAt,
    });

    res.status(200).json({ accessToken: refreshToken.accessToken });
  };

export const controllerRefresh =
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    refresh: UsecaseRefresh,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userRefreshToken = req.cookies.refreshToken;
    const deviceInfo = req.headers["user-agent"] ?? null;
    const userId = req.params.userId as string;
    const data: AuthRefreshDTO = {
      deviceInfo,
      refreshToken: userRefreshToken,
    };

    const accessToken = await refresh(
      authRepository,
      userRepository,
      userId,
      data,
    );

    res.status(200).json({ accessToken });
  };

export const controllerLogout =
  (
    authRepository: AuthRepository,
    userRepository: UserRepository,
    logout: UsecaseLogout,
  ) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const deviceInfo = req.headers["user-agent"] ?? null;
    const userId = req.params.userId as string;
    const data: AuthLogoutDTO = { deviceInfo };

    await logout(authRepository, userRepository, userId, data);
    res.status(201).json({ message: "Logout successfully" });
  };

export const controllerUpdatePassword =
  (userRepository: UserRepository, updatePassword: UsecaseUpdatePassword) =>
  async (req: HttpRequest, res: HttpResponse) => {
    const userId = req.params.userId as string;
    const data = req.body as AuthUpdatePasswordDTO;

    await updatePassword(userRepository, userId, data);

    res.status(201).json({ message: "Password updated successfully" });
  };

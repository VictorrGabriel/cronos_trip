import type { AuthRepository } from "./repository.contract";
import type { HttpResponse, HttpRequest } from "@shared/types";
import type { UpdatePasswordAuthDTO, LoginAuthDTO, TokenAuthDTO } from "@shared/dto/index";
import type { AuthLoginInput } from "./schemas";
import type { UserRepository } from "@modules/users/repository.contract";
import type {
  UsecaseRefresh,
  UsecaseLogin,
  UsecaseLogout,
  UsecaseUpdatePassword
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
    const data: LoginAuthDTO = {
      ...(req.body as AuthLoginInput),
      ipAddress,
      deviceInfo,
    };

    const refreshToken = await login(
      authRepository,
      userRepository,
      data,
    );

    res.cookie("refreshToken", refreshToken.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      expires: refreshToken.expiresAt,
    });

    res.status(200).json({ accessToken: refreshToken.accessToken, jti: refreshToken.jti });
  };

export const controllerRefresh =
  (authRepository: AuthRepository, refresh: UsecaseRefresh) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userRefreshToken = req.cookies.refreshToken as string;
    const data = req.body as TokenAuthDTO;

    const accessToken = await refresh(authRepository, userRefreshToken, data);

    res.status(200).json({ accessToken });
  };

export const controllerLogout =
  (authRepository: AuthRepository, logout: UsecaseLogout) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const data = req.body as TokenAuthDTO;
    await logout(authRepository, data);
    res.status(201).json({ message: "Logout successfully" });
  };

export const controllerUpdatePassword =
  (userRepository: UserRepository, updatePassword: UsecaseUpdatePassword) =>
  async (req: HttpRequest, res: HttpResponse) => {
    const userId = BigInt(req.params.userId as string);
    const data = req.body as UpdatePasswordAuthDTO;

    await updatePassword(userRepository, userId, data);

    res.status(200).json({message: "Password updated successfully"});
  };

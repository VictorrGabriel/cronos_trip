import type { UserRepository } from "./repository.contract";
import type { HttpRequest, HttpResponse } from "@shared/types";
import type { CreateUserDTO, UpdateUserDTO } from "@shared/dto/user.dto";
import type {
  UsecaseCreate,
  UsecaseFindAll,
  UsecaseDelete,
  UsecaseFindById,
  UsecaseUpdate,
} from "./usecase";

export const controllerFindAll =
  (userRepository: UserRepository, findAll: UsecaseFindAll) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const users = await findAll(userRepository);
    res.status(200).json(users);
  };

export const controllerFindById =
  (userRepository: UserRepository, findById: UsecaseFindById) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const publicId = req.params.id as string;
    const user = await findById(userRepository, publicId);
    res.status(200).json(user);
  };

export const controllerCreate =
  (userRepository: UserRepository, create: UsecaseCreate) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const data = req.body as CreateUserDTO;
    const user = await create(userRepository, data);

    res.status(200).json(user);
  };

export const controllerUpdate =
  (userRepository: UserRepository, update: UsecaseUpdate) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const publicId = req.params.id as string;
    const data = req.body as UpdateUserDTO;

    await update(userRepository, data, publicId);

    res.status(201).json({ message: "User updated successfully" });
  };

export const controllerDelete =
  (userRepository: UserRepository, deleteById: UsecaseDelete) =>
  async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const publicId = req.params.id as string;
    await deleteById(userRepository, publicId);
    res.status(201).json({ message: "User deleted successfully" });
  };

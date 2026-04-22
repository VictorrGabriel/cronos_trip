import type { UserRepository } from "../repository.contract";

export interface UsecaseDelete {
  (userRepository: UserRepository, id: bigint): Promise<void>;
}

export const usecaseDelete:UsecaseDelete = async (
  userRepository: UserRepository,
  id: bigint,
)=> {
  await userRepository.delete(id);
};

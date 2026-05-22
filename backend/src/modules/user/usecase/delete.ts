import type { UserRepository } from "../repository.contract";

export interface UsecaseDelete {
  (userRepository: UserRepository, id: string): Promise<void>;
}

export const usecaseDelete:UsecaseDelete = async (
  userRepository: UserRepository,
  publicId: string,
)=> {
  await userRepository.deleteByPublicId(publicId);
};

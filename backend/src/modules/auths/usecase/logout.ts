import type { UserRepository } from "@/modules/users/repository.contract";
import type { AuthRepository } from "../repository.contract";
import type { LogoutAuthDTO } from "@shared/dto/auth.dto";
import { UserNotFoundError } from "@/shared/errors";

export interface UsecaseLogout{
    (authRepository: AuthRepository, userRepository: UserRepository, userId: string, data: LogoutAuthDTO): Promise<void>
}

export const usecaseLogout: UsecaseLogout = async (authRepository, userRepository, userId, data) => {
    
    const user = await userRepository.findByPublicId(userId);
    if(!user){
        throw new UserNotFoundError();
    }
    await authRepository.revolkedByDevice(user.id, data.deviceInfo);
};

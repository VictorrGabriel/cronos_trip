import { verifyRefreshToken } from "@shared/utils/auth.helper";
import type { AuthRepository } from "../repository.contract";
import type { TokenAuthDTO } from "@shared/dto/auth.dto";
import { tokenSchema } from "../schemas";

export interface UsecaseLogout{
    (authRepository: AuthRepository, data: TokenAuthDTO): Promise<void>
}

export const usecaseLogout: UsecaseLogout = async (authRepository, data) => {
    await authRepository.revokedById(data.jti);
};
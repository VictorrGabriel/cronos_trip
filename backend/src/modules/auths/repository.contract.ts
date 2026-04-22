import type { RefreshToken, Prisma } from "@prisma/client";
import type { BaseRepository } from "@shared/repositories";

export interface AuthRepository extends BaseRepository<RefreshToken> {
  create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken>;
  update(
    id: bigint,
    data: Prisma.RefreshTokenUpdateInput,
  ): Promise<RefreshToken>;
  findByUserId(userId: bigint): Promise<RefreshToken[]>;
  revokedAllByUserId(userId: bigint): Promise<void>;
  revokedById(id: bigint): Promise<void>;
  findWhereIpAddressAndDevice(
    userId: bigint,
    ipAddress: string | null,
    deviceInfo: string | null
  ): Promise<RefreshToken[]>;
}

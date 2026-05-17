import { BaseRepositoryImpl } from "@shared/repositories";
import type { AuthRepository } from "./repository.contract";
import type { Prisma, RefreshToken, PrismaClient } from "@prisma/client";

export class AuthRepositoryImpl
  extends BaseRepositoryImpl<RefreshToken>
  implements AuthRepository
{
  protected readonly model = this.prisma.refreshToken;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findByUserId(userId: bigint): Promise<RefreshToken[]> {
    return await this.model.findMany({ where: { userId, revoked: false } });
  }

  async findDevicesByUserId(
    userId: bigint,
    deviceInfo: string | null,
  ): Promise<RefreshToken[]> {
    return await this.model.findMany({
      where: { userId, revoked: false, deviceInfo },
    });
  }

  async revokedAllByUserId(userId: bigint): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        data: { revoked: true },
        where: { userId },
      });
    });
  }

  async revokedById(id: bigint): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({ data: { revoked: true }, where: { id } });
    });
  }

  async create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return await this.prisma.$transaction(async (tx) => {
      return await tx.refreshToken.create({ data });
    });
  }

  async update(
    id: bigint,
    data: Prisma.RefreshTokenUpdateInput,
  ): Promise<RefreshToken> {
    return await this.prisma.$transaction(async (tx) => {
      return await tx.refreshToken.update({ data, where: { id } });
    });
  }

  async findWhereIpAddressAndDevice(
    userId: bigint,
    ipAddress: string | null,
    deviceInfo: string | null,
  ): Promise<RefreshToken[]> {
    return await this.model.findMany({
      where: { userId, deviceInfo, ipAddress, revoked: false },
    });
  }

  async findLatestUnrevoked(
    userId: bigint,
    deviceInfo: string | null,
  ): Promise<RefreshToken | null> {
    return await this.model.findFirst({
      where: { userId, deviceInfo, revoked: false },
      orderBy: { createdAt: "desc" },
    });
  }

  async revolkedByDevice(
    userId: bigint,
    deviceInfo: string | null,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        data: { revoked: true },
        where: { userId, deviceInfo },
      });
    });
  }
}

import { PrismaClient } from "@prisma/client";
import type { BaseRepository } from "./base.repository.contract";

type BaseModel<T> = {
  findMany(args?: Record<string, unknown>): Promise<T[]>;
  findUnique(args: { where: Record<string, unknown> }): Promise<T | null>;
  delete(args: { where: Record<string, unknown> }): Promise<T>;
};

export abstract class BaseRepositoryImpl<T> implements BaseRepository<T> {
  protected readonly prisma: PrismaClient;
  protected abstract readonly model: BaseModel<T>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<T[]> {
    return await this.model.findMany();
  }

  async findById(id: number | string | bigint): Promise<T | null> {
    return await this.model.findUnique({ where: { id } });
  }

  async findByPublicId(publicId: string): Promise<T | null> {
    return await this.model.findUnique({ where: { publicId } });
  }

  async delete(id: number | string | bigint): Promise<T> {
    return await this.model.delete({ where: { id } });
  }

   async deleteByPublicId(publicId: string): Promise<T> {
    return await this.model.delete({ where: { publicId } });
  }
}

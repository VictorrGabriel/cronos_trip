import { BaseRepositoryImpl } from "@shared/repositories";
import type { UserRepository } from "./repository.contract";
import type { Prisma, User, PrismaClient } from "@prisma/client";

export class UserRepositoryImpl
  extends BaseRepositoryImpl<User>
  implements UserRepository
{
  protected readonly model = this.prisma.user;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.model.create({ data });
  }

  async update(id: bigint, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.model.update({ data, where: { id } });
  }

  async existsById(id: bigint): Promise<boolean> {
    return (
      (await this.model.count({
        where: {
          id,
        },
      })) > 0
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (
      (await this.model.count({
        where: {
          email,
        },
      })) > 0
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findUnique({ where: { email } });
  }
}

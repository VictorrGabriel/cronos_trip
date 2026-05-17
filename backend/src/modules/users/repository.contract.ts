import type { User } from "@prisma/client";
import type { BaseRepository } from "@shared/repositories";
import { Prisma } from "@prisma/client";

export interface UserRepository extends BaseRepository<User> {
      create(data: Prisma.UserCreateInput): Promise<User>;
      updateByPublicId(id: string, data: Prisma.UserUpdateInput): Promise<User>;
      update(id: bigint, data: Prisma.UserUpdateInput): Promise<User>;
      findByEmail(email: string): Promise<User | null>;
      existsByEmail(email: string): Promise<boolean>;
      existsById(id: bigint): Promise<boolean>;
      findPublicId(id: bigint): Promise<string | null>;
}
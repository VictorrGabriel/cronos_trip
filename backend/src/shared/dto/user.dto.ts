import type { UserCreateSchema, UserUpdateSchema } from "@/modules/user/schemas";

export type UserCreateDTO = UserCreateSchema;
export type UserUpdateDTO = UserUpdateSchema;
export type UserResponseDTO = {
  id: string
  name: string;
  email: string;
  createdAt: Date;
  role?: string
} ;

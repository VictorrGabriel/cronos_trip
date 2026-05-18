import type { UserCreateInput, UserUpdateInput } from "@modules/users/schemas";

export type CreateUserDTO = UserCreateInput;
export type UpdateUserDTO = UserUpdateInput;
export type ResponseUserDTO = {
  id: string
  name: string;
  email: string;
  createdAt: Date;
  role?: string
} ;

import type { UserRepository } from "../repository.contract";
import type { ResponseUserDTO, CreateUserDTO } from "@shared/dto/user.dto";
import argon2 from "argon2";
import { userCreateSchema } from "../schemas";
import { pickByKeys } from "@shared/utils";
import { EmailConflictError, ValidationError } from "@shared/errors";

export interface UsecaseCreate {
  (
    userRepository: UserRepository,
    data: CreateUserDTO,
  ): Promise<ResponseUserDTO>;
}

export const usecaseCreate: UsecaseCreate = async (
  userRepository: UserRepository,
  data: CreateUserDTO,
) => {
  
  if(data.name.length < 3){
    throw new ValidationError({message: "User name must have at least 3 charecters"});
  }
  const existingEmail = await userRepository.existsByEmail(data.email);

  if (existingEmail) {
    throw new EmailConflictError({ message: `Email ${data.email} already exists` });
  }

  const passwordHash = await argon2.hash(data.password, {
    memoryCost: 64,
    timeCost: 12,
    parallelism: 4,
  });

  const entity = {
    name: data.name,
    email: data.email,
    passwordHash,
  };

  const user = await userRepository.create(entity);
  const userResponse: ResponseUserDTO = pickByKeys(user, ["name", "email", "createdAt"]);
  return userResponse;
};

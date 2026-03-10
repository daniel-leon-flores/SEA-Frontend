import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { User } from "../entities/user";
import { UserRepository } from "./ports/user.repository";
import { CreateUserDto } from "../entities/create-user.dto";

export class CreateUserInteractor implements UseCase<CreateUserDto, ApiResponse<User>> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload?: CreateUserDto): Promise<ApiResponse<User>> {
    if (!payload) {
      throw new Error("Missing payload for CreateUserInteractor");
    }
    return this.userRepository.createUser(payload);
  }
}

import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { User } from "../entities/user";
import { UserRepository } from "./ports/user.repository";
import { GetUsersDto } from "../entities/get-users.dto";

export class GetUsersInteractor implements UseCase<GetUsersDto, ApiResponse<User[]>> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload?: GetUsersDto): Promise<ApiResponse<User[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetUsersInteractor");
    }
    return this.userRepository.getUsers(payload.pagination, payload.role, payload.status);
  }
}

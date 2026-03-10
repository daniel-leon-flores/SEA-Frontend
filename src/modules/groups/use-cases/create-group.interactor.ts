import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Group } from "../entities/group";
import { GroupRepository } from "./ports/group.repository";
import { CreateGroupDto } from "../entities/create-group.dto";

export class CreateGroupInteractor implements UseCase<CreateGroupDto, ApiResponse<Group>> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(payload?: CreateGroupDto): Promise<ApiResponse<Group>> {
    if (!payload) {
      throw new Error("Missing payload for CreateGroupInteractor");
    }
    return this.groupRepository.createGroup(payload);
  }
}

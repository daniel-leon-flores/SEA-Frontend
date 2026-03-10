import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Group } from "../entities/group";
import { GroupRepository } from "./ports/group.repository";
import { GetGroupsDto } from "../entities/get-groups.dto";

export class GetGroupsInteractor implements UseCase<GetGroupsDto, ApiResponse<Group[]>> {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(payload?: GetGroupsDto): Promise<ApiResponse<Group[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetGroupsInteractor");
    }
    return this.groupRepository.getGroups(payload.pagination, payload.termId);
  }
}

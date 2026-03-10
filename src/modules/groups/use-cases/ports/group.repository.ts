import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Group } from "../../entities/group";
import { CreateGroupDto } from "../../entities/create-group.dto";

export interface GroupRepository {
  getGroups(pagination: PaginationDto, termId?: number): Promise<ApiResponse<Group[]>>;
  getGroupById(id: number): Promise<ApiResponse<Group>>;
  createGroup(group: CreateGroupDto): Promise<ApiResponse<Group>>;
  deleteGroup(id: number): Promise<ApiResponse<boolean>>;
}

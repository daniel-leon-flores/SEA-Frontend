import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Group } from "../entities/group";
import { GroupRepository } from "../use-cases/ports/group.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateGroupDto } from "../entities/create-group.dto";

export class GroupStorageGateway implements GroupRepository {
  async getGroups(pagination: PaginationDto, termId?: number): Promise<ApiResponse<Group[]>> {
    return handleRequest<Group[], PaginationDto>('post', `/api/groups/paged?termId=${termId || ''}`, pagination);
  }

  async getGroupById(id: number): Promise<ApiResponse<Group>> {
    return handleRequest<Group>('get', `/api/groups/${id}`);
  }

  async createGroup(group: CreateGroupDto): Promise<ApiResponse<Group>> {
    return handleRequest<Group, CreateGroupDto>('post', '/api/groups/save', group);
  }

  async deleteGroup(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/groups/${id}`);
  }
}

import { ApiResponse, PaginatedData } from '@/kernel/types';
import { handleRequest } from '@/config/http-client.gateway';
import { GenerationGroupRepository } from '../use-cases/ports/generation-group.repository';
import { GenerationGroup, AvailableTeacher, CreateAssignmentDto, GroupTeacherAssignment } from '../entities/generation-group';
import { CreateGenerationGroupDto } from '../entities/create-generation-group.dto';
import { UpdateGenerationGroupDto } from '../entities/update-generation-group.dto';

export class GenerationGroupStorageGateway implements GenerationGroupRepository {
  async getGenerationGroups(idGeneration: number, groupLetter?: string, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<GenerationGroup>>> {
    const params = new URLSearchParams();
    params.set('id_generation', String(idGeneration));
    if (groupLetter) params.set('group_letter', groupLetter);
    if (status !== undefined) params.set('status', String(status));
    if (page !== undefined) params.set('page', String(page));
    if (pageSize !== undefined) params.set('page_size', String(pageSize));
    return handleRequest<PaginatedData<GenerationGroup>>(
      'get',
      `/api/academic/groups/?${params.toString()}`
    );
  }

  async createGenerationGroup(payload: CreateGenerationGroupDto): Promise<ApiResponse<GenerationGroup>> {
    return handleRequest<GenerationGroup, CreateGenerationGroupDto>('post', '/api/academic/groups/', payload);
  }

  async updateGenerationGroup(id: number, payload: UpdateGenerationGroupDto): Promise<ApiResponse<GenerationGroup>> {
    return handleRequest<GenerationGroup, UpdateGenerationGroupDto>('put', `/api/academic/groups/${id}/`, payload);
  }

  async setGenerationGroupStatus(id: number, status: boolean): Promise<ApiResponse<{ id_group: number; status: boolean }>> {
    return handleRequest<{ id_group: number; status: boolean }, { status: boolean }>(
      'patch',
      `/api/academic/groups/${id}/status/`,
      { status }
    );
  }

  async deleteGenerationGroup(id: number): Promise<ApiResponse<{ id_group: number; status: boolean }>> {
    return handleRequest<{ id_group: number; status: boolean }>('delete', `/api/academic/groups/${id}/`);
  }

  async createAssignment(groupId: number, payload: CreateAssignmentDto): Promise<ApiResponse<GroupTeacherAssignment>> {
    return handleRequest<GroupTeacherAssignment, CreateAssignmentDto>(
      'post',
      `/api/academic/groups/${groupId}/assignments/`,
      payload
    );
  }

  async deleteAssignment(groupId: number, assignmentId: number): Promise<ApiResponse<{ id_assignment: number }>> {
    return handleRequest<{ id_assignment: number }>(
      'delete',
      `/api/academic/groups/${groupId}/assignments/${assignmentId}/`
    );
  }

  async getAvailableTeachers(groupId: number, subjectId: number): Promise<ApiResponse<{ results: AvailableTeacher[] }>> {
    return handleRequest<{ results: AvailableTeacher[] }>(
      'get',
      `/api/academic/groups/${groupId}/available-teachers/?subject_id=${subjectId}`
    );
  }
}

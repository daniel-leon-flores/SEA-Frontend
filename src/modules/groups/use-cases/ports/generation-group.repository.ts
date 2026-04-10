import { ApiResponse, PaginatedData } from '@/kernel/types';
import { GenerationGroup, AvailableTeacher, CreateAssignmentDto, GroupTeacherAssignment } from '../../entities/generation-group';
import { CreateGenerationGroupDto } from '../../entities/create-generation-group.dto';
import { UpdateGenerationGroupDto } from '../../entities/update-generation-group.dto';

export interface GenerationGroupRepository {
  getGenerationGroups(idGeneration: number, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<GenerationGroup>>>;
  createGenerationGroup(payload: CreateGenerationGroupDto): Promise<ApiResponse<GenerationGroup>>;
  updateGenerationGroup(id: number, payload: UpdateGenerationGroupDto): Promise<ApiResponse<GenerationGroup>>;
  setGenerationGroupStatus(id: number, status: boolean): Promise<ApiResponse<{ id_group: number; status: boolean }>>;
  deleteGenerationGroup(id: number): Promise<ApiResponse<{ id_group: number; status: boolean }>>;
  createAssignment(groupId: number, payload: CreateAssignmentDto): Promise<ApiResponse<GroupTeacherAssignment>>;
  deleteAssignment(groupId: number, assignmentId: number): Promise<ApiResponse<{ id_assignment: number }>>;
  getAvailableTeachers(groupId: number, subjectId: number): Promise<ApiResponse<{ results: AvailableTeacher[] }>>;
}

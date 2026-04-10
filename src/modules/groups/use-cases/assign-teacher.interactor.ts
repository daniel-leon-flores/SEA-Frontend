import { ApiResponse } from '@/kernel/types';
import { GroupTeacherAssignment, CreateAssignmentDto } from '../entities/generation-group';
import { GenerationGroupRepository } from './ports/generation-group.repository';

export class CreateAssignmentInteractor {
  constructor(private readonly repository: GenerationGroupRepository) {}

  execute(groupId: number, payload: CreateAssignmentDto): Promise<ApiResponse<GroupTeacherAssignment>> {
    return this.repository.createAssignment(groupId, payload);
  }
}

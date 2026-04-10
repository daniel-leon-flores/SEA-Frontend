import { ApiResponse } from '@/kernel/types';
import { GenerationGroupRepository } from './ports/generation-group.repository';

export class DeleteAssignmentInteractor {
  constructor(private readonly repository: GenerationGroupRepository) {}

  execute(groupId: number, assignmentId: number): Promise<ApiResponse<{ id_assignment: number }>> {
    return this.repository.deleteAssignment(groupId, assignmentId);
  }
}

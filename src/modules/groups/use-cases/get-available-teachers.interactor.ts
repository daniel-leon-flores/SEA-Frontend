import { ApiResponse } from '@/kernel/types';
import { AvailableTeacher } from '../entities/generation-group';
import { GenerationGroupRepository } from './ports/generation-group.repository';

export class GetAvailableTeachersInteractor {
  constructor(private readonly repository: GenerationGroupRepository) {}

  execute(groupId: number, subjectId: number): Promise<ApiResponse<{ results: AvailableTeacher[] }>> {
    return this.repository.getAvailableTeachers(groupId, subjectId);
  }
}

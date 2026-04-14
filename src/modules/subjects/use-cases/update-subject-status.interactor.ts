import type { UseCase } from '@/kernel/contract';
import type { ApiResponse } from '@/kernel/types';
import type { SubjectRepository } from './ports/subject.repository';

export type UpdateSubjectStatusInput = { id: number; status: boolean };

export class UpdateSubjectStatusInteractor
  implements UseCase<UpdateSubjectStatusInput, ApiResponse<{ id_subject: number; status: boolean }>>
{
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async execute(payload?: UpdateSubjectStatusInput): Promise<ApiResponse<{ id_subject: number; status: boolean }>> {
    if (!payload) {
      throw new Error('Missing payload for UpdateSubjectStatusInteractor');
    }
    return this.subjectRepository.updateSubjectStatus(payload.id, payload.status);
  }
}

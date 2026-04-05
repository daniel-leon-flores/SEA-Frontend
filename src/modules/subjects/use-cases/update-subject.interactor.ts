import type { UseCase } from '@/kernel/contract';
import type { ApiResponse } from '@/kernel/types';
import type { Subject } from '../entities/subject';
import type { SubjectRepository } from './ports/subject.repository';
import type { UpdateSubjectDto } from '../entities/update-subject.dto';

export type UpdateSubjectInput = { id: number; dto: UpdateSubjectDto };

export class UpdateSubjectInteractor implements UseCase<UpdateSubjectInput, ApiResponse<Subject>> {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async execute(payload?: UpdateSubjectInput): Promise<ApiResponse<Subject>> {
    if (!payload) {
      throw new Error('Missing payload for UpdateSubjectInteractor');
    }
    return this.subjectRepository.updateSubject(payload.id, payload.dto);
  }
}

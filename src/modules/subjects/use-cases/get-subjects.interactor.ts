import type { UseCase } from '@/kernel/contract';
import type { ApiResponse } from '@/kernel/types';
import type { SubjectListPayload } from '../entities/subject';
import type { SubjectRepository } from './ports/subject.repository';
import type { GetSubjectsDto } from '../entities/get-subjects.dto';

export class GetSubjectsInteractor implements UseCase<GetSubjectsDto, ApiResponse<SubjectListPayload>> {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async execute(payload?: GetSubjectsDto): Promise<ApiResponse<SubjectListPayload>> {
    if (!payload) {
      throw new Error('Missing payload for GetSubjectsInteractor');
    }
    return this.subjectRepository.getSubjects(payload);
  }
}

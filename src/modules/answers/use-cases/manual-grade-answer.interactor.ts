import { ApiResponse } from '@/kernel/types';
import type { ManualGradeDto, ManualGradeResult } from '../entities/exam-answer';
import type { AnswersRepository } from './ports/answers.repository';

export class ManualGradeAnswerInteractor {
  constructor(private readonly repository: AnswersRepository) {}

  execute(payload: ManualGradeDto): Promise<ApiResponse<ManualGradeResult>> {
    return this.repository.manualGradeAnswer(payload);
  }
}

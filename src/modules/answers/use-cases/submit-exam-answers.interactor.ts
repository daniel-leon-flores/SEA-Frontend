import { ApiResponse } from '@/kernel/types';
import type { SubmitExamAnswersDto, SubmitExamAnswersResult } from '../entities/exam-answer';
import type { AnswersRepository } from './ports/answers.repository';

export class SubmitExamAnswersInteractor {
  constructor(private readonly repository: AnswersRepository) {}

  execute(payload: SubmitExamAnswersDto): Promise<ApiResponse<SubmitExamAnswersResult>> {
    return this.repository.submitExamAnswers(payload);
  }
}

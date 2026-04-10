import { ApiResponse } from '@/kernel/types';
import type { AssignmentAnswersResult } from '../entities/exam-answer';
import type { AnswersRepository } from './ports/answers.repository';

export class GetAssignmentAnswersInteractor {
  constructor(private readonly repository: AnswersRepository) {}

  execute(assignmentId: number): Promise<ApiResponse<AssignmentAnswersResult>> {
    return this.repository.getAssignmentAnswers(assignmentId);
  }
}

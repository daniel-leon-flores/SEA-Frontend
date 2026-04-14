import { handleRequest } from '@/config/http-client.gateway';
import { ApiResponse } from '@/kernel/types';
import type {
  SubmitExamAnswersDto,
  SubmitExamAnswersResult,
  AssignmentAnswersResult,
  ManualGradeDto,
  ManualGradeResult,
} from '../entities/exam-answer';
import type { AnswersRepository } from '../use-cases/ports/answers.repository';

export class AnswersStorageGateway implements AnswersRepository {
  submitExamAnswers(payload: SubmitExamAnswersDto): Promise<ApiResponse<SubmitExamAnswersResult>> {
    return handleRequest<SubmitExamAnswersResult, SubmitExamAnswersDto>(
      'post',
      '/api/answers/submit/',
      payload,
    );
  }

  getAssignmentAnswers(assignmentId: number): Promise<ApiResponse<AssignmentAnswersResult>> {
    return handleRequest<AssignmentAnswersResult>(
      'get',
      `/api/answers/assignment/${assignmentId}/`,
    );
  }

  manualGradeAnswer(payload: ManualGradeDto): Promise<ApiResponse<ManualGradeResult>> {
    return handleRequest<ManualGradeResult, ManualGradeDto>(
      'post',
      '/api/answers/manual-grade/',
      payload,
    );
  }
}

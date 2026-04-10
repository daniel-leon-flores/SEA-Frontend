import { ApiResponse } from '@/kernel/types';
import type {
  SubmitExamAnswersDto,
  SubmitExamAnswersResult,
  AssignmentAnswersResult,
  ManualGradeDto,
  ManualGradeResult,
} from '../../entities/exam-answer';

export interface AnswersRepository {
  submitExamAnswers(payload: SubmitExamAnswersDto): Promise<ApiResponse<SubmitExamAnswersResult>>;
  getAssignmentAnswers(assignmentId: number): Promise<ApiResponse<AssignmentAnswersResult>>;
  manualGradeAnswer(payload: ManualGradeDto): Promise<ApiResponse<ManualGradeResult>>;
}

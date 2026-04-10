import { ApiResponse } from '@/kernel/types';
import type {
  SubmitExamAnswersDto,
  SubmitExamAnswersResult,
  AssignmentAnswersResult,
  ManualGradeDto,
  ManualGradeResult,
} from '../entities/exam-answer';
import type { AnswersRepository } from '../use-cases/ports/answers.repository';
import { AnswersStorageGateway } from './answers.storage.gateway';
import { SubmitExamAnswersInteractor } from '../use-cases/submit-exam-answers.interactor';
import { GetAssignmentAnswersInteractor } from '../use-cases/get-assignment-answers.interactor';
import { ManualGradeAnswerInteractor } from '../use-cases/manual-grade-answer.interactor';

export class AnswersController {
  private getRepository(): AnswersRepository {
    return new AnswersStorageGateway();
  }

  submitExamAnswers(payload: SubmitExamAnswersDto): Promise<ApiResponse<SubmitExamAnswersResult>> {
    return new SubmitExamAnswersInteractor(this.getRepository()).execute(payload);
  }

  getAssignmentAnswers(assignmentId: number): Promise<ApiResponse<AssignmentAnswersResult>> {
    return new GetAssignmentAnswersInteractor(this.getRepository()).execute(assignmentId);
  }

  manualGradeAnswer(payload: ManualGradeDto): Promise<ApiResponse<ManualGradeResult>> {
    return new ManualGradeAnswerInteractor(this.getRepository()).execute(payload);
  }
}

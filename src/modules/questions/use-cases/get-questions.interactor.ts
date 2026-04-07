import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { QuestionListPayload } from '../entities/question-bank';
import { QuestionRepository } from './ports/question.repository';
import { GetQuestionsDto } from '../entities/get-questions.dto';

export class GetQuestionsInteractor implements UseCase<GetQuestionsDto, ApiResponse<QuestionListPayload>> {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async execute(payload?: GetQuestionsDto): Promise<ApiResponse<QuestionListPayload>> {
    if (!payload) {
      throw new Error('Missing payload for GetQuestionsInteractor');
    }
    return this.questionRepository.listQuestions(payload.pagination, {
      subjectId: payload.subjectId,
      difficulty: payload.difficulty,
      type: payload.type,
    });
  }
}

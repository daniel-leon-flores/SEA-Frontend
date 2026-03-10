import { ApiResponse, PaginationDto } from '@/kernel/types';
import { QuestionBank } from '../entities/question-bank';
import { QuestionRepository } from '../use-cases/ports/question.repository';
import { QuestionStorageGateway } from './question.storage.gateway';
import { GetQuestionsInteractor } from '../use-cases/get-questions.interactor';
import { CreateQuestionDto } from '../entities/create-question.dto';
import { CreateQuestionInteractor } from '../use-cases/create-question.interactor';

export class QuestionController {
  getQuestions(pagination: PaginationDto, subjectId?: number, difficulty?: string): Promise<ApiResponse<QuestionBank[]>> {
    const repository: QuestionRepository = new QuestionStorageGateway();
    const interactor = new GetQuestionsInteractor(repository);
    return interactor.execute({ pagination, subjectId, difficulty });
  }

  createQuestion(question: CreateQuestionDto): Promise<ApiResponse<QuestionBank>> {
    const repository: QuestionRepository = new QuestionStorageGateway();
    const interactor = new CreateQuestionInteractor(repository);
    return interactor.execute(question);
  }
}

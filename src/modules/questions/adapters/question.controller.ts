import { ApiResponse } from '@/kernel/types';
import { QuestionBank, QuestionListPayload } from '../entities/question-bank';
import { QuestionRepository ,UploadReport} from '../use-cases/ports/question.repository';
import { QuestionStorageGateway } from './question.storage.gateway';
import { GetQuestionsInteractor } from '../use-cases/get-questions.interactor';
import { CreateQuestionDto, UpdateQuestionDto } from '../entities/create-question.dto';
import { CreateQuestionInteractor } from '../use-cases/create-question.interactor';
import { GetQuestionsDto } from '../entities/get-questions.dto';

export class QuestionController {
  private repository(): QuestionRepository {
    return new QuestionStorageGateway();
  }

  getQuestions(payload: GetQuestionsDto): Promise<ApiResponse<QuestionListPayload>> {
    const interactor = new GetQuestionsInteractor(this.repository());
    return interactor.execute(payload);
  }

  getQuestionById(id: number): Promise<ApiResponse<QuestionBank>> {
    return this.repository().getQuestionById(id);
  }

  createQuestion(question: CreateQuestionDto): Promise<ApiResponse<QuestionBank>> {
    const interactor = new CreateQuestionInteractor(this.repository());
    return interactor.execute(question);
  }

  updateQuestion(id: number, question: UpdateQuestionDto): Promise<ApiResponse<QuestionBank>> {
    return this.repository().updateQuestion(id, question);
  }

  deleteQuestion(id: number): Promise<ApiResponse<boolean>> {
    return this.repository().deleteQuestion(id);
  }

  uploadExcel(file: File): Promise<ApiResponse<UploadReport>> {
    return this.repository().uploadExcel(file);
  }

  downloadTemplateBlob(): Promise<Blob> {
    return QuestionStorageGateway.downloadTemplateBlob();
  }
}

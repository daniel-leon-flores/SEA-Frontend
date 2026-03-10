import { ApiResponse, PaginationDto } from "@/kernel/types";
import { QuestionBank } from "../entities/question-bank";
import { QuestionRepository } from "../use-cases/ports/question.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateQuestionDto } from "../entities/create-question.dto";

export class QuestionStorageGateway implements QuestionRepository {
  async getQuestions(pagination: PaginationDto, subjectId?: number, difficulty?: string): Promise<ApiResponse<QuestionBank[]>> {
    return handleRequest<QuestionBank[], PaginationDto>('post', `/api/questions/paged?subjectId=${subjectId || ''}&difficulty=${difficulty || ''}`, pagination);
  }

  async getQuestionById(id: number): Promise<ApiResponse<QuestionBank>> {
    return handleRequest<QuestionBank>('get', `/api/questions/${id}`);
  }

  async createQuestion(question: CreateQuestionDto): Promise<ApiResponse<QuestionBank>> {
    return handleRequest<QuestionBank, CreateQuestionDto>('post', '/api/questions/save', question);
  }

  async deleteQuestion(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/questions/${id}`);
  }
}

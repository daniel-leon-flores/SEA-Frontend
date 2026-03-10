import { ApiResponse, PaginationDto } from "@/kernel/types";
import { QuestionBank } from "../../entities/question-bank";
import { CreateQuestionDto } from "../../entities/create-question.dto";

export interface QuestionRepository {
  getQuestions(pagination: PaginationDto, subjectId?: number, difficulty?: string): Promise<ApiResponse<QuestionBank[]>>;
  getQuestionById(id: number): Promise<ApiResponse<QuestionBank>>;
  createQuestion(question: CreateQuestionDto): Promise<ApiResponse<QuestionBank>>;
  deleteQuestion(id: number): Promise<ApiResponse<boolean>>;
}

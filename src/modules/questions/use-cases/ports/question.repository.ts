import { ApiResponse, PaginationDto } from '@/kernel/types';
import { QuestionBank, QuestionListPayload } from '../../entities/question-bank';
import { CreateQuestionDto, UpdateQuestionDto } from '../../entities/create-question.dto';

export interface QuestionRepository {
  listQuestions(
    pagination: PaginationDto,
    filters?: { subjectId?: number; difficulty?: string; type?: string },
  ): Promise<ApiResponse<QuestionListPayload>>;
  getQuestionById(id: number): Promise<ApiResponse<QuestionBank>>;
  createQuestion(question: CreateQuestionDto): Promise<ApiResponse<QuestionBank>>;
  updateQuestion(id: number, question: UpdateQuestionDto): Promise<ApiResponse<QuestionBank>>;
  deleteQuestion(id: number): Promise<ApiResponse<boolean>>;
  uploadExcel(file: File): Promise<ApiResponse<UploadReport>>;
}

export type UploadReport = {
  total_rows: number;
  created: number;
  errors: { row: number; error: string }[];
  valid_subjects?: string[];
  denied_subjects?: string[];
  partial_subject_access?: boolean;
  errors_file?: {
    filename: string;
    content_base64: string;
  } | null;
};

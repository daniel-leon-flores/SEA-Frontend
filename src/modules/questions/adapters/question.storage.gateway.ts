import { ApiResponse, PaginationDto } from '@/kernel/types';
import { handleRequest } from '@/config/http-client.gateway';
import AxiosClient from '@/config/axios';
import { QuestionBank, QuestionListPayload } from '../entities/question-bank';
import { QuestionRepository, UploadReport } from '../use-cases/ports/question.repository';
import { CreateQuestionDto, UpdateQuestionDto } from '../entities/create-question.dto';

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export class QuestionStorageGateway implements QuestionRepository {
  async listQuestions(
    pagination: PaginationDto,
    filters?: { subjectId?: number; difficulty?: string; type?: string },
  ): Promise<ApiResponse<QuestionListPayload>> {
    const qs = buildQuery({
      page: pagination.page ?? 1,
      page_size: pagination.limit ?? 10,
      id_subject: filters?.subjectId,
      difficulty: filters?.difficulty,
      type: filters?.type,
    });
    return handleRequest<QuestionListPayload>('get', `/api/questions/${qs}`);
  }

  async getQuestionById(id: number): Promise<ApiResponse<QuestionBank>> {
    return handleRequest<QuestionBank>('get', `/api/questions/${id}/`);
  }

  async createQuestion(question: CreateQuestionDto): Promise<ApiResponse<QuestionBank>> {
    return handleRequest<QuestionBank, CreateQuestionDto>('post', '/api/questions/', question);
  }

  async updateQuestion(id: number, question: UpdateQuestionDto): Promise<ApiResponse<QuestionBank>> {
    return handleRequest<QuestionBank, UpdateQuestionDto>('put', `/api/questions/${id}/`, question);
  }

  async deleteQuestion(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/questions/${id}/`);
  }

  async uploadExcel(file: File): Promise<ApiResponse<UploadReport>> {
    const form = new FormData();
    form.append('file', file);
    return handleRequest<UploadReport, FormData>('post', '/api/questions/upload/', form);
  }

  /** Blob download — caller triggers save; not wrapped in ApiResponse JSON. */
  static async downloadTemplateBlob(): Promise<Blob> {
    const res = await AxiosClient.get('/api/questions/template/', { responseType: 'blob' });
    return res.data as Blob;
  }
}

import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "../use-cases/ports/exam.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateExamDto } from "../entities/create-exam.dto";
import { AssignExamDto } from "../entities/assign-exam.dto";

export class ExamStorageGateway implements ExamRepository {
  async getExams(pagination: PaginationDto, status?: string): Promise<ApiResponse<Exam[]>> {
    return handleRequest<Exam[], PaginationDto>('post', `/api/exams/paged?status=${status || ''}`, pagination);
  }

  async getExamById(id: number): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam>('get', `/api/exams/${id}`);
  }

  async createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam, CreateExamDto>('post', '/api/exams/save', exam);
  }

  async assignExam(data: AssignExamDto): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam, AssignExamDto>('post', '/api/exams/assign', data);
  }

  async deleteExam(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/exams/${id}`);
  }
}

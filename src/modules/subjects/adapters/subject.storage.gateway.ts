import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Subject } from "../entities/subject";
import { SubjectRepository } from "../use-cases/ports/subject.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateSubjectDto } from "../entities/create-subject.dto";

export class SubjectStorageGateway implements SubjectRepository {
  async getSubjects(pagination: PaginationDto, teacherId?: number): Promise<ApiResponse<Subject[]>> {
    return handleRequest<Subject[], PaginationDto>('post', `/api/subjects/paged?teacherId=${teacherId || ''}`, pagination);
  }

  async getSubjectById(id: number): Promise<ApiResponse<Subject>> {
    return handleRequest<Subject>('get', `/api/subjects/${id}`);
  }

  async createSubject(subject: CreateSubjectDto): Promise<ApiResponse<Subject>> {
    return handleRequest<Subject, CreateSubjectDto>('post', '/api/subjects/save', subject);
  }

  async deleteSubject(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/subjects/${id}`);
  }
}

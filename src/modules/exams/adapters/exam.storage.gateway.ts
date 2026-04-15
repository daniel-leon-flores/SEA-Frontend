import { ApiResponse, PaginatedData } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "../use-cases/ports/exam.repository";
import httpClient, { handleRequest } from "@/config/http-client.gateway";
import { GetExamsDto } from "../entities/get-exams.dto";
import { CreateExamDto, UpdateExamDto } from "../entities/create-exam.dto";
import {
  AssignExamDto,
  ExamGroupAssignment,
  AcademicGroup,
  Subject,
  GroupStats,
  GroupStudent,
  GetGroupStudentsDto,
} from "../entities/assign-exam.dto";
import { MyAssignment, GetMyAssignmentsDto } from "../entities/my-assignment";
import type { ExamQuestionsResponse, ReplaceExamQuestionsDto } from "../entities/exam-linked-question";

function buildQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') continue;
    if (val === '') continue;
    qs.append(key, String(val));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export class ExamStorageGateway implements ExamRepository {
  async getMyExams(params: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>> {
    return handleRequest<PaginatedData<Exam>>('get', `/api/exams/created-by-me/${buildQueryString({ ...params })}`);
  }

  async getAllExams(params: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>> {
    return handleRequest<PaginatedData<Exam>>('get', `/api/exams/${buildQueryString({ ...params })}`);
  }

  async getExamById(id: number): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam>('get', `/api/exams/${id}/`);
  }

  async createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam, CreateExamDto>('post', '/api/exams/', exam);
  }

  async updateExam(id: number, exam: UpdateExamDto): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam, UpdateExamDto>('put', `/api/exams/${id}/`, exam);
  }

  async updateExamStatus(id: number, status: boolean): Promise<ApiResponse<{ id_exam: number; status: boolean }>> {
    return handleRequest<{ id_exam: number; status: boolean }, { status: boolean }>(
      'patch', `/api/exams/${id}/status/`, { status }
    );
  }

  async updateExamSecureMode(id: number, secure_mode: boolean): Promise<ApiResponse<{ id_exam: number; secure_mode: boolean }>> {
    return handleRequest<{ id_exam: number; secure_mode: boolean }, { secure_mode: boolean }>(
      'patch', `/api/exams/${id}/secure-mode/`, { secure_mode }
    );
  }

  async getExamAssignments(examId: number): Promise<ApiResponse<ExamGroupAssignment[]>> {
    return handleRequest<ExamGroupAssignment[]>('get', `/api/exams/exam-assignments/assign/?exam_id=${examId}`);
  }

  async assignExamToGroups(data: AssignExamDto): Promise<ApiResponse<unknown>> {
    return handleRequest<unknown, AssignExamDto>('post', '/api/exams/exam-assignments/assign/', data);
  }

  async getAcademicGroups(page = 1, pageSize = 100): Promise<ApiResponse<PaginatedData<AcademicGroup>>> {
    return handleRequest<PaginatedData<AcademicGroup>>('get', `/api/academic/groups/${buildQueryString({ page, page_size: pageSize })}`);
  }

  async getAssignableGroups(examId: number): Promise<ApiResponse<AcademicGroup[]>> {
    return handleRequest<AcademicGroup[]>('get', `/api/academic/groups/my-groups/${buildQueryString({ exam_id: examId })}`);
  }

  async getMySubjects(): Promise<ApiResponse<{ results: Subject[] }>> {
    return handleRequest<{ results: Subject[] }>('get', '/api/academic/subjects/my-subjects/');
  }

  async getGroupStats(examId: number, groupId: number): Promise<ApiResponse<GroupStats>> {
    return handleRequest<GroupStats>('get', `/api/exams/${examId}/stats/groups/${groupId}/`);
  }

  async getGroupStudents(examId: number, groupId: number, params: GetGroupStudentsDto): Promise<ApiResponse<PaginatedData<GroupStudent>>> {
    return handleRequest<PaginatedData<GroupStudent>>('get', `/api/exams/${examId}/groups/${groupId}/students/${buildQueryString({ ...params })}`);
  }

  async getStudentAssignments(params: GetMyAssignmentsDto): Promise<ApiResponse<MyAssignment[]>> {
    return handleRequest<MyAssignment[]>('get', `/api/exams/exam-assignments/my-assignments/${buildQueryString({ ...params })}`);
  }

  async getExamQuestions(examId: number): Promise<ApiResponse<ExamQuestionsResponse>> {
    return handleRequest<ExamQuestionsResponse>('get', `/api/exams/${examId}/questions/`);
  }

  async putExamQuestions(examId: number, body: ReplaceExamQuestionsDto): Promise<ApiResponse<ExamQuestionsResponse>> {
    return handleRequest<ExamQuestionsResponse, ReplaceExamQuestionsDto>(
      'put',
      `/api/exams/${examId}/questions/`,
      body,
    );
  }

  async exportGradesExcel(examId: number, groupId: number): Promise<Blob> {
    const res = await httpClient.getBlob(`/api/exams/${examId}/grades/groups/${groupId}/export/excel/`);
    return res.data as Blob;
  }

  async exportGradesPDF(examId: number, groupId: number): Promise<Blob> {
    const res = await httpClient.getBlob(`/api/exams/${examId}/grades/groups/${groupId}/export/pdf/`);
    return res.data as Blob;
  }
}

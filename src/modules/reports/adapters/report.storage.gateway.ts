import { ApiResponse } from '@/kernel/types';
import { handleRequest } from '@/config/http-client.gateway';
import { ReportRepository } from '../use-cases/ports/report.repository';
import { ReportFiltersDto } from '../entities/report-filters.dto';

import {
  ExamReportData,
  GroupReportData,
  StudentReportData,
  StudentExamDetailData,
  GroupOption,
  SubjectOption,
  ExamOption,
  StudentOption,
} from '../entities/report-data';

import {
  ByExamDto,
  ByGroupDto,
  ByStudentDto,
  StudentExamDetailDto,
} from '../entities/report-request.dto';

// ===== HELPERS =====

function extractPaginatedOptions<TRaw, TOption>(
  res: ApiResponse<any>,
  mapper: (item: TRaw) => TOption,
): ApiResponse<TOption[]> {

  if (!res.success || !res.data) {
    return { ...res, data: [] } as ApiResponse<TOption[]>;
  }

  const raw = res.data;
  const items: TRaw[] = Array.isArray(raw) ? raw : (raw.results ?? []);

  return {
    ...res,
    data: items.map(mapper),
  };
}

// ===== GATEWAY =====

export class ReportStorageGateway implements ReportRepository {

  // =========================
  // REPORTES
  // =========================

  async getExamReport(filters: ReportFiltersDto): Promise<ApiResponse<ExamReportData>> {
    if (!filters.examId) throw new Error('examId requerido');

    const payload: ByExamDto = {
      examId: filters.examId,
    };

    return handleRequest('post', '/api/reports/by-exam/', payload);
  }

  async getGroupReport(filters: ReportFiltersDto): Promise<ApiResponse<GroupReportData>> {
    if (!filters.groupId) throw new Error('groupId requerido');

    const payload: ByGroupDto = {
      groupId: filters.groupId,
    };

    return handleRequest('post', '/api/reports/by-group/', payload);
  }

  async getStudentReport(filters: ReportFiltersDto): Promise<ApiResponse<StudentReportData>> {
    if (!filters.studentId) throw new Error('studentId requerido');

    const payload: ByStudentDto = {
      studentId: filters.studentId,
    };

    return handleRequest('post', '/api/reports/by-student/', payload);
  }

  async getStudentExamDetail(filters: ReportFiltersDto): Promise<ApiResponse<StudentExamDetailData>> {
    if (!filters.studentId || !filters.examId) {
      throw new Error('studentId y examId requeridos');
    }

    const payload: StudentExamDetailDto = {
      studentId: filters.studentId,
      examId: filters.examId,
    };

    return handleRequest('post', '/api/reports/student-exam-detail/', payload);
  }

  // =========================
  // CATÁLOGOS (FILTROS)
  // =========================

async getGroups(): Promise<ApiResponse<GroupOption[]>> {
  const res = await handleRequest<any>('get', '/api/reports/groups/');

  return extractPaginatedOptions(res, (g: any) => ({
    id: g.id_group,
    label: `${g.group_letter} - Nivel ${g.academic_level} (${g.generation_year})`,
    groupLetter: g.group_letter,
    academicLevel: g.academic_level,
    generationYear: g.generation_year,
    idGeneration: g.id_generation,
    assignments: Array.isArray(g.assignments) ? g.assignments : [],
  }));
}

  async getSubjects(): Promise<ApiResponse<SubjectOption[]>> {
    const res = await handleRequest<any>('get', '/api/academic/subjects/');

    return extractPaginatedOptions(res, (s: any) => ({
      id: s.id_subject,
      label: s.name,
    }));
  }

  async getExams(subjectId?: number, groupId?: number): Promise<ApiResponse<ExamOption[]>> {
    const params = new URLSearchParams();

    if (subjectId) params.append('subject_id', String(subjectId));
    if (groupId) params.append('group_id', String(groupId));

    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await handleRequest<any>('get', `/api/exams/${query}`);

    return extractPaginatedOptions(res, (e: any) => ({
      id: e.id_exam,
      label: e.title,
    }));
  }

  async getStudents(groupId?: number): Promise<ApiResponse<StudentOption[]>> {
    const params = new URLSearchParams();
    params.append('role', 'student');
    if (groupId) {
      params.append('group', String(groupId));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await handleRequest<any>('get', `/api/users/${query}`);

    const list = res?.data?.results ?? [];
    return {
      ...res,
      data: list.map((u: any) => ({
        id: u.id_user,
        label: u.full_name,
      })),
    };
  }
}
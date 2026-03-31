import { ApiResponse } from '@/kernel/types';
import { handleRequest } from '@/config/http-client.gateway';
import { ReportRepository } from '../use-cases/ports/report.repository';
import { ReportFiltersDto } from '../entities/report-filters.dto';
import {
  ExamReportData,
  PeriodReportData,
  GroupReportData,
  StudentReportData,
  StudentExamDetailData,
  PeriodOption,
  GroupOption,
  SubjectOption,
  ExamOption,
  StudentOption,
} from '../entities/report-data';
import {
  MOCK_ENABLED,
  MOCK_EXAM_OPTIONS,
  MOCK_STUDENT_OPTIONS,
  mockExamReport,
  mockPeriodReport,
  mockGroupReport,
  mockStudentReport,
  mockStudentExamDetail,
} from './mock-reports';

// Helper: extract results from paginated backend response and map to options
function extractPaginatedOptions<TRaw, TOption>(
  res: ApiResponse<any>,
  mapper: (item: TRaw) => TOption,
): ApiResponse<TOption[]> {
  if (!res.success || !res.data) return { ...res, data: [] } as ApiResponse<TOption[]>;
  const raw = res.data;
  const items: TRaw[] = Array.isArray(raw) ? raw : (raw.results ?? []);
  return { ...res, data: items.map(mapper) };
}

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, message: 'OK (mock)', code: 200, timestamp: new Date().toISOString() };
}

export class ReportStorageGateway implements ReportRepository {
  // --- Report data ---
  async getExamReport(filters: ReportFiltersDto): Promise<ApiResponse<ExamReportData>> {
    if (MOCK_ENABLED) return ok(mockExamReport(filters.examId ?? 1));
    return handleRequest<ExamReportData, ReportFiltersDto>('post', '/api/reports/by-exam/', filters);
  }

  async getPeriodReport(filters: ReportFiltersDto): Promise<ApiResponse<PeriodReportData>> {
    if (MOCK_ENABLED) return ok(mockPeriodReport(filters.periodId ?? 1));
    return handleRequest<PeriodReportData, ReportFiltersDto>('post', '/api/reports/by-period/', filters);
  }

  async getGroupReport(filters: ReportFiltersDto): Promise<ApiResponse<GroupReportData>> {
    if (MOCK_ENABLED) return ok(mockGroupReport(filters.groupId ?? 1));
    return handleRequest<GroupReportData, ReportFiltersDto>('post', '/api/reports/by-group/', filters);
  }

  async getStudentReport(filters: ReportFiltersDto): Promise<ApiResponse<StudentReportData>> {
    if (MOCK_ENABLED) return ok(mockStudentReport(filters.studentId ?? 101));
    return handleRequest<StudentReportData, ReportFiltersDto>('post', '/api/reports/by-student/', filters);
  }

  async getStudentExamDetail(filters: ReportFiltersDto): Promise<ApiResponse<StudentExamDetailData>> {
    if (MOCK_ENABLED) return ok(mockStudentExamDetail(filters.studentId ?? 101, filters.examId ?? 1));
    return handleRequest<StudentExamDetailData, ReportFiltersDto>('post', '/api/reports/student-exam-detail/', filters);
  }

  // --- Filter options (paginated backend → flat option arrays) ---
  async getPeriods(): Promise<ApiResponse<PeriodOption[]>> {
    const res = await handleRequest<any>('get', '/api/academic/periods/');
    return extractPaginatedOptions(res, (p: any) => ({
      id: p.id_period,
      label: `${p.period_name} ${p.year}`,
    }));
  }

  async getGroups(periodId?: number): Promise<ApiResponse<GroupOption[]>> {
    const query = periodId ? `?period_id=${periodId}` : '';
    const res = await handleRequest<any>('get', `/api/academic/groups/${query}`);
    return extractPaginatedOptions(res, (g: any) => ({
      id: g.id_group,
      label: `${g.group_letter} - Nivel ${g.academic_level} (${g.generation_year})`,
    }));
  }

  async getSubjects(): Promise<ApiResponse<SubjectOption[]>> {
    const res = await handleRequest<any>('get', '/api/academic/subjects/');
    return extractPaginatedOptions(res, (s: any) => ({
      id: s.id_subject,
      label: s.name,
    }));
  }

  async getExams(_subjectId?: number, _groupId?: number): Promise<ApiResponse<ExamOption[]>> {
    // Endpoint no implementado aún — usar mock siempre
    if (MOCK_ENABLED) return ok(MOCK_EXAM_OPTIONS);
    const params = new URLSearchParams();
    if (_subjectId) params.append('subject_id', String(_subjectId));
    if (_groupId) params.append('group_id', String(_groupId));
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await handleRequest<any>('get', `/api/exams/${query}`);
    return extractPaginatedOptions(res, (e: any) => ({
      id: e.id_exam,
      label: e.title,
    }));
  }

  async getStudents(groupId?: number): Promise<ApiResponse<StudentOption[]>> {
    // Si hay groupId, intentar desde API; si falla o sin groupId, devolver mock
    if (MOCK_ENABLED) return ok(MOCK_STUDENT_OPTIONS);
    const query = groupId ? `?group_id=${groupId}` : '';
    const res = await handleRequest<any>('get', `/api/users/${query}`);
    return extractPaginatedOptions(res, (u: any) => ({
      id: u.id_user,
      label: `${u.matricula} - ${u.first_name} ${u.last_name}`,
    }));
  }
}

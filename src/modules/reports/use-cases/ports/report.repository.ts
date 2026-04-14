import { ApiResponse } from '@/kernel/types';
import { ReportFiltersDto } from '../../entities/report-filters.dto';

import {
  ExamReportData,
  GroupReportData,
  StudentReportData,
  StudentExamDetailData,
  GroupOption,
  SubjectOption,
  ExamOption,
  StudentOption,
} from '../../entities/report-data';

export interface ReportRepository {
  // ===== REPORTES =====
  getExamReport(filters: ReportFiltersDto): Promise<ApiResponse<ExamReportData>>;
  getGroupReport(filters: ReportFiltersDto): Promise<ApiResponse<GroupReportData>>;
  getStudentReport(filters: ReportFiltersDto): Promise<ApiResponse<StudentReportData>>;
  getStudentExamDetail(filters: ReportFiltersDto): Promise<ApiResponse<StudentExamDetailData>>;

  // ===== FILTROS =====
  getGroups(): Promise<ApiResponse<GroupOption[]>>;
  getSubjects(): Promise<ApiResponse<SubjectOption[]>>;
  getExams(subjectId?: number, groupId?: number): Promise<ApiResponse<ExamOption[]>>;
  getStudents(groupId?: number): Promise<ApiResponse<StudentOption[]>>;
}
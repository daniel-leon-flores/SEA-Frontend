import { ApiResponse } from '@/kernel/types';
import { ReportFiltersDto } from '../../entities/report-filters.dto';
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
} from '../../entities/report-data';

export interface ReportRepository {
  // Report data endpoints
  getExamReport(filters: ReportFiltersDto): Promise<ApiResponse<ExamReportData>>;
  getPeriodReport(filters: ReportFiltersDto): Promise<ApiResponse<PeriodReportData>>;
  getGroupReport(filters: ReportFiltersDto): Promise<ApiResponse<GroupReportData>>;
  getStudentReport(filters: ReportFiltersDto): Promise<ApiResponse<StudentReportData>>;
  getStudentExamDetail(filters: ReportFiltersDto): Promise<ApiResponse<StudentExamDetailData>>;

  // Filter options (for dropdowns)
  getPeriods(): Promise<ApiResponse<PeriodOption[]>>;
  getGroups(periodId?: number): Promise<ApiResponse<GroupOption[]>>;
  getSubjects(): Promise<ApiResponse<SubjectOption[]>>;
  getExams(subjectId?: number, groupId?: number): Promise<ApiResponse<ExamOption[]>>;
  getStudents(groupId?: number): Promise<ApiResponse<StudentOption[]>>;
}

import { ApiResponse } from '@/kernel/types';
import { ReportRepository } from '../use-cases/ports/report.repository';
import { ReportStorageGateway } from './report.storage.gateway';
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
import { GetExamReportInteractor } from '../use-cases/get-exam-report.interactor';
import { GetPeriodReportInteractor } from '../use-cases/get-period-report.interactor';
import { GetGroupReportInteractor } from '../use-cases/get-group-report.interactor';
import { GetStudentReportInteractor } from '../use-cases/get-student-report.interactor';
import { GetStudentExamDetailInteractor } from '../use-cases/get-student-exam-detail.interactor';

export class ReportController {
  private getRepository(): ReportRepository {
    return new ReportStorageGateway();
  }

  // --- Report generation ---
  getExamReport(filters: ReportFiltersDto): Promise<ApiResponse<ExamReportData>> {
    const interactor = new GetExamReportInteractor(this.getRepository());
    return interactor.execute(filters);
  }

  getPeriodReport(filters: ReportFiltersDto): Promise<ApiResponse<PeriodReportData>> {
    const interactor = new GetPeriodReportInteractor(this.getRepository());
    return interactor.execute(filters);
  }

  getGroupReport(filters: ReportFiltersDto): Promise<ApiResponse<GroupReportData>> {
    const interactor = new GetGroupReportInteractor(this.getRepository());
    return interactor.execute(filters);
  }

  getStudentReport(filters: ReportFiltersDto): Promise<ApiResponse<StudentReportData>> {
    const interactor = new GetStudentReportInteractor(this.getRepository());
    return interactor.execute(filters);
  }

  getStudentExamDetail(filters: ReportFiltersDto): Promise<ApiResponse<StudentExamDetailData>> {
    const interactor = new GetStudentExamDetailInteractor(this.getRepository());
    return interactor.execute(filters);
  }

  // --- Filter options (no interactor needed — simple data retrieval) ---
  getPeriods(): Promise<ApiResponse<PeriodOption[]>> {
    return this.getRepository().getPeriods();
  }

  getGroups(periodId?: number): Promise<ApiResponse<GroupOption[]>> {
    return this.getRepository().getGroups(periodId);
  }

  getSubjects(): Promise<ApiResponse<SubjectOption[]>> {
    return this.getRepository().getSubjects();
  }

  getExams(subjectId?: number, groupId?: number): Promise<ApiResponse<ExamOption[]>> {
    return this.getRepository().getExams(subjectId, groupId);
  }

  getStudents(groupId?: number): Promise<ApiResponse<StudentOption[]>> {
    return this.getRepository().getStudents(groupId);
  }
}

import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { StudentReportData } from '../entities/report-data';
import { ReportFiltersDto } from '../entities/report-filters.dto';
import { ReportRepository } from './ports/report.repository';

export class GetStudentReportInteractor implements UseCase<ReportFiltersDto, ApiResponse<StudentReportData>> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(payload?: ReportFiltersDto): Promise<ApiResponse<StudentReportData>> {
    if (!payload || !payload.studentId) {
      throw new Error('Missing studentId for GetStudentReportInteractor');
    }
    return this.reportRepository.getStudentReport(payload);
  }
}

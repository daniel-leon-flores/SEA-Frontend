import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { ExamReportData } from '../entities/report-data';
import { ReportFiltersDto } from '../entities/report-filters.dto';
import { ReportRepository } from './ports/report.repository';

export class GetExamReportInteractor implements UseCase<ReportFiltersDto, ApiResponse<ExamReportData>> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(payload?: ReportFiltersDto): Promise<ApiResponse<ExamReportData>> {
    if (!payload || !payload.examId) {
      throw new Error('Missing examId for GetExamReportInteractor');
    }
    return this.reportRepository.getExamReport(payload);
  }
}

import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { PeriodReportData } from '../entities/report-data';
import { ReportFiltersDto } from '../entities/report-filters.dto';
import { ReportRepository } from './ports/report.repository';

export class GetPeriodReportInteractor implements UseCase<ReportFiltersDto, ApiResponse<PeriodReportData>> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(payload?: ReportFiltersDto): Promise<ApiResponse<PeriodReportData>> {
    if (!payload || !payload.periodId) {
      throw new Error('Missing periodId for GetPeriodReportInteractor');
    }
    return this.reportRepository.getPeriodReport(payload);
  }
}

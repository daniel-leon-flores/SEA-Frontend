import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { GroupReportData } from '../entities/report-data';
import { ReportFiltersDto } from '../entities/report-filters.dto';
import { ReportRepository } from './ports/report.repository';

export class GetGroupReportInteractor implements UseCase<ReportFiltersDto, ApiResponse<GroupReportData>> {
  constructor(private readonly reportRepository: ReportRepository) { }

  async execute(payload?: ReportFiltersDto): Promise<ApiResponse<GroupReportData>> {
    if (!payload?.groupId) {
      throw new Error('Missing groupId for GetGroupReportInteractor');
    }
    return this.reportRepository.getGroupReport(payload);
  }
}

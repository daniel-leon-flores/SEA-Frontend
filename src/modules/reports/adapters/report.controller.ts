import { ApiResponse, PaginationDto } from '@/kernel/types';
import { Report } from '../entities/report';
import { ReportRepository } from '../use-cases/ports/report.repository';
import { ReportStorageGateway } from './report.storage.gateway';
import { GetReportsInteractor } from '../use-cases/get-reports.interactor';

export class ReportController {
  getReports(pagination: PaginationDto, type?: string): Promise<ApiResponse<Report[]>> {
    const repository: ReportRepository = new ReportStorageGateway();
    const interactor = new GetReportsInteractor(repository);
    return interactor.execute({ pagination, type });
  }
}

import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Report } from "../entities/report";
import { ReportRepository } from "../use-cases/ports/report.repository";
import { handleRequest } from "@/config/http-client.gateway";

export class ReportStorageGateway implements ReportRepository {
  async getReports(pagination: PaginationDto, type?: string): Promise<ApiResponse<Report[]>> {
    return handleRequest<Report[], PaginationDto>('post', `/api/reports/paged?type=${type || ''}`, pagination);
  }

  async getReportById(id: number): Promise<ApiResponse<Report>> {
    return handleRequest<Report>('get', `/api/reports/${id}`);
  }

  async generateReport(type: string, filters: Record<string, any>): Promise<ApiResponse<Report>> {
    return handleRequest<Report, { type: string; filters: Record<string, any> }>('post', '/api/reports/generate', { type, filters });
  }
}

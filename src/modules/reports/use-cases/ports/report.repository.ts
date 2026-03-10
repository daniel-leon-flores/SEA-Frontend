import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Report } from "../../entities/report";

export interface ReportRepository {
  getReports(pagination: PaginationDto, type?: string): Promise<ApiResponse<Report[]>>;
  getReportById(id: number): Promise<ApiResponse<Report>>;
  generateReport(type: string, filters: Record<string, any>): Promise<ApiResponse<Report>>;
}

import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Report } from "../entities/report";
import { ReportRepository } from "./ports/report.repository";
import { GetReportsDto } from "../entities/get-reports.dto";

export class GetReportsInteractor implements UseCase<GetReportsDto, ApiResponse<Report[]>> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(payload?: GetReportsDto): Promise<ApiResponse<Report[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetReportsInteractor");
    }
    return this.reportRepository.getReports(payload.pagination, payload.type);
  }
}

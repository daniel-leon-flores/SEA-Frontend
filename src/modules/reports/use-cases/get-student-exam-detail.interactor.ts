import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { StudentExamDetailData } from '../entities/report-data';
import { ReportFiltersDto } from '../entities/report-filters.dto';
import { ReportRepository } from './ports/report.repository';

export class GetStudentExamDetailInteractor implements UseCase<ReportFiltersDto, ApiResponse<StudentExamDetailData>> {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(payload?: ReportFiltersDto): Promise<ApiResponse<StudentExamDetailData>> {
    if (!payload || !payload.studentId || !payload.examId) {
      throw new Error('Missing studentId or examId for GetStudentExamDetailInteractor');
    }
    return this.reportRepository.getStudentExamDetail(payload);
  }
}

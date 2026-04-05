import { UseCase } from '@/kernel/contract';
import { ApiResponse, PaginatedData } from '@/kernel/types';
import type { Period } from '../entities/period';
import type { PeriodRepository } from './ports/period.repository';
import type { GetPeriodsDto } from '../entities/get-periods.dto';

export class GetPeriodsInteractor implements UseCase<GetPeriodsDto, ApiResponse<PaginatedData<Period>>> {
  constructor(private readonly repository: PeriodRepository) {}

  async execute(payload?: GetPeriodsDto): Promise<ApiResponse<PaginatedData<Period>>> {
    return this.repository.getPeriods(payload?.year, payload?.status, payload?.page, payload?.pageSize);
  }
}

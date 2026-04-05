import { ApiResponse, PaginatedData } from '@/kernel/types';
import type { Period } from '../../entities/period';
import type { CreatePeriodDto } from '../../entities/create-period.dto';
import type { UpdatePeriodDto } from '../../entities/update-period.dto';

export interface PeriodRepository {
  getPeriods(year?: number, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<Period>>>;
  getPeriodById(id: number): Promise<ApiResponse<Period>>;
  createPeriod(payload: CreatePeriodDto): Promise<ApiResponse<Period>>;
  updatePeriod(id: number, payload: UpdatePeriodDto): Promise<ApiResponse<Period>>;
  setPeriodStatus(id: number, status: boolean): Promise<ApiResponse<{ id_period: number; status: boolean }>>;
}

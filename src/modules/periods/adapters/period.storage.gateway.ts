import { ApiResponse, PaginatedData } from '@/kernel/types';
import { handleRequest } from '@/config/http-client.gateway';
import type { PeriodRepository } from '../use-cases/ports/period.repository';
import type { Period } from '../entities/period';
import type { CreatePeriodDto } from '../entities/create-period.dto';
import type { UpdatePeriodDto } from '../entities/update-period.dto';

export class PeriodStorageGateway implements PeriodRepository {
  async getPeriods(year?: number, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<Period>>> {
    const params = new URLSearchParams();
    if (year !== undefined) params.set('year', String(year));
    if (status !== undefined) params.set('status', String(status));
    if (page !== undefined) params.set('page', String(page));
    if (pageSize !== undefined) params.set('page_size', String(pageSize));
    const query = params.toString();
    const endpoint = query ? `/api/academic/periods/?${query}` : '/api/academic/periods/';
    return handleRequest<PaginatedData<Period>>('get', endpoint);
  }

  async getPeriodById(id: number): Promise<ApiResponse<Period>> {
    return handleRequest<Period>('get', `/api/academic/periods/${id}/`);
  }

  async createPeriod(payload: CreatePeriodDto): Promise<ApiResponse<Period>> {
    return handleRequest<Period, CreatePeriodDto>('post', '/api/academic/periods/', payload);
  }

  async updatePeriod(id: number, payload: UpdatePeriodDto): Promise<ApiResponse<Period>> {
    return handleRequest<Period, UpdatePeriodDto>('put', `/api/academic/periods/${id}/`, payload);
  }

  async setPeriodStatus(id: number, status: boolean): Promise<ApiResponse<{ id_period: number; status: boolean }>> {
    return handleRequest<{ id_period: number; status: boolean }, { status: boolean }>(
      'patch',
      `/api/academic/periods/${id}/status/`,
      { status },
    );
  }
}

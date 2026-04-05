import { ApiResponse, PaginatedData } from '@/kernel/types';
import type { PeriodRepository } from '../use-cases/ports/period.repository';
import { PeriodStorageGateway } from './period.storage.gateway';
import type { Period } from '../entities/period';
import type { CreatePeriodDto } from '../entities/create-period.dto';
import type { UpdatePeriodDto } from '../entities/update-period.dto';
import { GetPeriodsInteractor } from '../use-cases/get-periods.interactor';
import { GetPeriodByIdInteractor } from '../use-cases/get-period-by-id.interactor';
import { CreatePeriodInteractor } from '../use-cases/create-period.interactor';
import { UpdatePeriodInteractor } from '../use-cases/update-period.interactor';
import { SetPeriodStatusInteractor } from '../use-cases/set-period-status.interactor';

export class PeriodController {
  private readonly repository: PeriodRepository;

  constructor() {
    this.repository = new PeriodStorageGateway();
  }

  getPeriods(year?: number, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<Period>>> {
    return new GetPeriodsInteractor(this.repository).execute({ year, status, page, pageSize });
  }

  getPeriodById(id: number): Promise<ApiResponse<Period>> {
    return new GetPeriodByIdInteractor(this.repository).execute(id);
  }

  createPeriod(payload: CreatePeriodDto): Promise<ApiResponse<Period>> {
    return new CreatePeriodInteractor(this.repository).execute(payload);
  }

  updatePeriod(id: number, payload: UpdatePeriodDto): Promise<ApiResponse<Period>> {
    return new UpdatePeriodInteractor(this.repository).execute({ id, data: payload });
  }

  setPeriodStatus(id: number, status: boolean): Promise<ApiResponse<{ id_period: number; status: boolean }>> {
    return new SetPeriodStatusInteractor(this.repository).execute({ id, status });
  }
}

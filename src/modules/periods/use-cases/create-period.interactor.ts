import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import type { Period } from '../entities/period';
import type { CreatePeriodDto } from '../entities/create-period.dto';
import type { PeriodRepository } from './ports/period.repository';

export class CreatePeriodInteractor implements UseCase<CreatePeriodDto, ApiResponse<Period>> {
  constructor(private readonly repository: PeriodRepository) {}

  async execute(payload?: CreatePeriodDto): Promise<ApiResponse<Period>> {
    if (!payload) {
      throw new Error('CreatePeriodInteractor requires payload');
    }
    return this.repository.createPeriod(payload);
  }
}

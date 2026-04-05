import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import type { Period } from '../entities/period';
import type { PeriodRepository } from './ports/period.repository';

export class GetPeriodByIdInteractor implements UseCase<number, ApiResponse<Period>> {
  constructor(private readonly repository: PeriodRepository) {}

  async execute(payload?: number): Promise<ApiResponse<Period>> {
    if (payload === undefined) {
      throw new Error('GetPeriodByIdInteractor requires id');
    }
    return this.repository.getPeriodById(payload);
  }
}

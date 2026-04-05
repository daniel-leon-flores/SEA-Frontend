import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import type { Period } from '../entities/period';
import type { UpdatePeriodDto } from '../entities/update-period.dto';
import type { PeriodRepository } from './ports/period.repository';

export type UpdatePeriodPayload = { id: number; data: UpdatePeriodDto };

export class UpdatePeriodInteractor implements UseCase<UpdatePeriodPayload, ApiResponse<Period>> {
  constructor(private readonly repository: PeriodRepository) {}

  async execute(payload?: UpdatePeriodPayload): Promise<ApiResponse<Period>> {
    if (!payload) {
      throw new Error('UpdatePeriodInteractor requires payload');
    }
    return this.repository.updatePeriod(payload.id, payload.data);
  }
}

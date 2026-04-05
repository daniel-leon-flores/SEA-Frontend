import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import type { PeriodRepository } from './ports/period.repository';

export type SetPeriodStatusPayload = { id: number; status: boolean };

export class SetPeriodStatusInteractor implements UseCase<SetPeriodStatusPayload, ApiResponse<{ id_period: number; status: boolean }>> {
  constructor(private readonly repository: PeriodRepository) {}

  async execute(payload?: SetPeriodStatusPayload): Promise<ApiResponse<{ id_period: number; status: boolean }>> {
    if (!payload) {
      throw new Error('SetPeriodStatusInteractor requires payload');
    }
    return this.repository.setPeriodStatus(payload.id, payload.status);
  }
}

import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { GenerationGroupRepository } from './ports/generation-group.repository';

export class SetGenerationGroupStatusInteractor implements UseCase<{ id: number; status: boolean }, ApiResponse<{ id_group: number; status: boolean }>> {
  constructor(private readonly repository: GenerationGroupRepository) {}

  async execute(payload?: { id: number; status: boolean }): Promise<ApiResponse<{ id_group: number; status: boolean }>> {
    if (!payload) {
      throw new Error('Missing payload for SetGenerationGroupStatusInteractor');
    }
    return this.repository.setGenerationGroupStatus(payload.id, payload.status);
  }
}

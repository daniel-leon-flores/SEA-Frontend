import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { GenerationGroupRepository } from './ports/generation-group.repository';

export class DeleteGenerationGroupInteractor implements UseCase<number, ApiResponse<{ id_group: number; status: boolean }>> {
  constructor(private readonly repository: GenerationGroupRepository) {}

  async execute(payload?: number): Promise<ApiResponse<{ id_group: number; status: boolean }>> {
    if (!payload) {
      throw new Error('Missing payload for DeleteGenerationGroupInteractor');
    }
    return this.repository.deleteGenerationGroup(payload);
  }
}

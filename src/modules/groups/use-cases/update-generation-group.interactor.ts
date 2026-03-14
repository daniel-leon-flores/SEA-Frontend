import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { GenerationGroup } from '../entities/generation-group';
import { GenerationGroupRepository } from './ports/generation-group.repository';
import { UpdateGenerationGroupDto } from '../entities/update-generation-group.dto';

export class UpdateGenerationGroupInteractor implements UseCase<{ id: number; payload: UpdateGenerationGroupDto }, ApiResponse<GenerationGroup>> {
  constructor(private readonly repository: GenerationGroupRepository) {}

  async execute(data?: { id: number; payload: UpdateGenerationGroupDto }): Promise<ApiResponse<GenerationGroup>> {
    if (!data) {
      throw new Error('Missing data for UpdateGenerationGroupInteractor');
    }
    return this.repository.updateGenerationGroup(data.id, data.payload);
  }
}

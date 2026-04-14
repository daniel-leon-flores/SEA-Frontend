import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { GenerationGroup } from '../entities/generation-group';
import { GenerationGroupRepository } from './ports/generation-group.repository';
import { CreateGenerationGroupDto } from '../entities/create-generation-group.dto';

export class CreateGenerationGroupInteractor implements UseCase<CreateGenerationGroupDto, ApiResponse<GenerationGroup>> {
  constructor(private readonly repository: GenerationGroupRepository) {}

  async execute(payload?: CreateGenerationGroupDto): Promise<ApiResponse<GenerationGroup>> {
    if (!payload) {
      throw new Error('Missing payload for CreateGenerationGroupInteractor');
    }
    return this.repository.createGenerationGroup(payload);
  }
}

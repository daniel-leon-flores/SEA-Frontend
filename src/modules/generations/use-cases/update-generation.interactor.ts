import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { Generation } from '../entities/generation';
import { GenerationRepository } from './ports/generation.repository';
import { UpdateGenerationDto } from '../entities/update-generation.dto';

export type UpdateGenerationPayload = {
  id: number;
  data: UpdateGenerationDto;
};

export class UpdateGenerationInteractor implements UseCase<UpdateGenerationPayload, ApiResponse<Generation>> {
  constructor(private readonly repository: GenerationRepository) {}

  async execute(payload?: UpdateGenerationPayload): Promise<ApiResponse<Generation>> {
    if (!payload) {
      throw new Error('Missing payload for UpdateGenerationInteractor');
    }
    return this.repository.updateGeneration(payload.id, payload.data);
  }
}

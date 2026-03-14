import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { Generation } from '../entities/generation';
import { GenerationRepository } from './ports/generation.repository';
import { CreateGenerationDto } from '../entities/create-generation.dto';

export class CreateGenerationInteractor implements UseCase<CreateGenerationDto, ApiResponse<Generation>> {
  constructor(private readonly repository: GenerationRepository) {}

  async execute(payload?: CreateGenerationDto): Promise<ApiResponse<Generation>> {
    if (!payload) {
      throw new Error('Missing payload for CreateGenerationInteractor');
    }
    return this.repository.createGeneration(payload);
  }
}

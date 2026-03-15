import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { GenerationRepository } from './ports/generation.repository';

export class DeleteGenerationInteractor implements UseCase<number, ApiResponse<{ id_generation: number; status: boolean }>> {
  constructor(private readonly repository: GenerationRepository) {}

  async execute(payload?: number): Promise<ApiResponse<{ id_generation: number; status: boolean }>> {
    if (!payload) {
      throw new Error('Missing payload for DeleteGenerationInteractor');
    }
    return this.repository.deleteGeneration(payload);
  }
}

import { UseCase } from '@/kernel/contract';
import { ApiResponse } from '@/kernel/types';
import { GenerationRepository } from './ports/generation.repository';

export type SetGenerationStatusPayload = {
  id: number;
  status: boolean;
};

export class SetGenerationStatusInteractor implements UseCase<SetGenerationStatusPayload, ApiResponse<{ id_generation: number; status: boolean }>> {
  constructor(private readonly repository: GenerationRepository) {}

  async execute(payload?: SetGenerationStatusPayload): Promise<ApiResponse<{ id_generation: number; status: boolean }>> {
    if (!payload) {
      throw new Error('Missing payload for SetGenerationStatusInteractor');
    }
    return this.repository.setGenerationStatus(payload.id, payload.status);
  }
}

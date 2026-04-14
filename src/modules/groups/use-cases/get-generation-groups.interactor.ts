import { UseCase } from '@/kernel/contract';
import { ApiResponse, PaginatedData } from '@/kernel/types';
import { GenerationGroup } from '../entities/generation-group';
import { GenerationGroupRepository } from './ports/generation-group.repository';

export class GetGenerationGroupsInteractor implements UseCase<
  { idGeneration: number; groupLetter?: string; status?: boolean; page?: number; pageSize?: number },
  ApiResponse<PaginatedData<GenerationGroup>>
> {
  constructor(private readonly repository: GenerationGroupRepository) {}

  async execute(
    payload?: { idGeneration: number; groupLetter?: string; status?: boolean; page?: number; pageSize?: number }
  ): Promise<ApiResponse<PaginatedData<GenerationGroup>>> {
    if (!payload) {
      throw new Error('Missing payload for GetGenerationGroupsInteractor');
    }
    return this.repository.getGenerationGroups(payload.idGeneration, payload.groupLetter, payload.status, payload.page, payload.pageSize);
  }
}

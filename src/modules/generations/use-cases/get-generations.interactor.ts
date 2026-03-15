import { UseCase } from '@/kernel/contract';
import { ApiResponse, PaginatedData } from '@/kernel/types';
import { Generation } from '../entities/generation';
import { GenerationRepository } from './ports/generation.repository';
import { GetGenerationsDto } from '../entities/get-generations.dto';

export class GetGenerationsInteractor implements UseCase<GetGenerationsDto, ApiResponse<PaginatedData<Generation>>> {
  constructor(private readonly repository: GenerationRepository) {}

  async execute(payload?: GetGenerationsDto): Promise<ApiResponse<PaginatedData<Generation>>> {
    return this.repository.getGenerations(payload?.idGeneration, payload?.status, payload?.page, payload?.pageSize);
  }
}

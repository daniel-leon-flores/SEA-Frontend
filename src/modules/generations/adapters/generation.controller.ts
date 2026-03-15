import { ApiResponse, PaginatedData } from '@/kernel/types';
import { GenerationRepository } from '../use-cases/ports/generation.repository';
import { GenerationStorageGateway } from './generation.storage.gateway';
import { Generation } from '../entities/generation';
import { CreateGenerationDto } from '../entities/create-generation.dto';
import { UpdateGenerationDto } from '../entities/update-generation.dto';
import { GetGenerationsInteractor } from '../use-cases/get-generations.interactor';
import { CreateGenerationInteractor } from '../use-cases/create-generation.interactor';
import { UpdateGenerationInteractor } from '../use-cases/update-generation.interactor';
import { SetGenerationStatusInteractor } from '../use-cases/set-generation-status.interactor';
import { DeleteGenerationInteractor } from '../use-cases/delete-generation.interactor';

export class GenerationController {
  private readonly repository: GenerationRepository;

  constructor() {
    this.repository = new GenerationStorageGateway();
  }

  getGenerations(idGeneration?: number, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<Generation>>> {
    return new GetGenerationsInteractor(this.repository).execute({ idGeneration, status, page, pageSize });
  }

  createGeneration(payload: CreateGenerationDto): Promise<ApiResponse<Generation>> {
    return new CreateGenerationInteractor(this.repository).execute(payload);
  }

  updateGeneration(id: number, payload: UpdateGenerationDto): Promise<ApiResponse<Generation>> {
    return new UpdateGenerationInteractor(this.repository).execute({ id, data: payload });
  }

  setGenerationStatus(id: number, status: boolean): Promise<ApiResponse<{ id_generation: number; status: boolean }>> {
    return new SetGenerationStatusInteractor(this.repository).execute({ id, status });
  }

  deleteGeneration(id: number): Promise<ApiResponse<{ id_generation: number; status: boolean }>> {
    return new DeleteGenerationInteractor(this.repository).execute(id);
  }
}

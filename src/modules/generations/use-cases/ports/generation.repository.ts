import { ApiResponse, PaginatedData } from '@/kernel/types';
import { Generation } from '../../entities/generation';
import { CreateGenerationDto } from '../../entities/create-generation.dto';
import { UpdateGenerationDto } from '../../entities/update-generation.dto';

export interface GenerationRepository {
  getGenerations(idGeneration?: number, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<Generation>>>;
  createGeneration(payload: CreateGenerationDto): Promise<ApiResponse<Generation>>;
  updateGeneration(id: number, payload: UpdateGenerationDto): Promise<ApiResponse<Generation>>;
  setGenerationStatus(id: number, status: boolean): Promise<ApiResponse<{ id_generation: number; status: boolean }>>;
  deleteGeneration(id: number): Promise<ApiResponse<{ id_generation: number; status: boolean }>>;
}

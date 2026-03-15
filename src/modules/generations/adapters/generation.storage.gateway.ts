import { ApiResponse, PaginatedData } from '@/kernel/types';
import { handleRequest } from '@/config/http-client.gateway';
import { GenerationRepository } from '../use-cases/ports/generation.repository';
import { Generation } from '../entities/generation';
import { CreateGenerationDto } from '../entities/create-generation.dto';
import { UpdateGenerationDto } from '../entities/update-generation.dto';

export class GenerationStorageGateway implements GenerationRepository {
  async getGenerations(idGeneration?: number, status?: boolean, page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<Generation>>> {
    const params = new URLSearchParams();
    if (idGeneration !== undefined) params.set('id_generation', String(idGeneration));
    if (status !== undefined) params.set('status', String(status));
    if (page !== undefined) params.set('page', String(page));
    if (pageSize !== undefined) params.set('page_size', String(pageSize));
    const query = params.toString();
    const endpoint = query ? `/api/academic/generations/?${query}` : '/api/academic/generations/';
    return handleRequest<PaginatedData<Generation>>('get', endpoint);
  }

  async createGeneration(payload: CreateGenerationDto): Promise<ApiResponse<Generation>> {
    return handleRequest<Generation, CreateGenerationDto>('post', '/api/academic/generations/', payload);
  }

  async updateGeneration(id: number, payload: UpdateGenerationDto): Promise<ApiResponse<Generation>> {
    return handleRequest<Generation, UpdateGenerationDto>('put', `/api/academic/generations/${id}/`, payload);
  }

  async setGenerationStatus(id: number, status: boolean): Promise<ApiResponse<{ id_generation: number; status: boolean }>> {
    return handleRequest<{ id_generation: number; status: boolean }, { status: boolean }>(
      'patch',
      `/api/academic/generations/${id}/status/`,
      { status }
    );
  }

  async deleteGeneration(id: number): Promise<ApiResponse<{ id_generation: number; status: boolean }>> {
    return handleRequest<{ id_generation: number; status: boolean }>('delete', `/api/academic/generations/${id}/`);
  }
}

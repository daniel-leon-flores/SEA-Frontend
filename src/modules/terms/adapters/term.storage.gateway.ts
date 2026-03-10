import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Term } from "../entities/term";
import { TermRepository } from "../use-cases/ports/term.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateTermDto } from "../entities/create-term.dto";

export class TermStorageGateway implements TermRepository {
  async getTerms(pagination: PaginationDto): Promise<ApiResponse<Term[]>> {
    return handleRequest<Term[], PaginationDto>('post', '/api/terms/paged', pagination);
  }

  async getTermById(id: number): Promise<ApiResponse<Term>> {
    return handleRequest<Term>('get', `/api/terms/${id}`);
  }

  async createTerm(term: CreateTermDto): Promise<ApiResponse<Term>> {
    return handleRequest<Term, CreateTermDto>('post', '/api/terms/save', term);
  }

  async deleteTerm(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/terms/${id}`);
  }
}

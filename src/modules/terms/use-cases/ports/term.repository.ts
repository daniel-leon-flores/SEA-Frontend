import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Term } from "../../entities/term";
import { CreateTermDto } from "../../entities/create-term.dto";

export interface TermRepository {
  getTerms(pagination: PaginationDto): Promise<ApiResponse<Term[]>>;
  getTermById(id: number): Promise<ApiResponse<Term>>;
  createTerm(term: CreateTermDto): Promise<ApiResponse<Term>>;
  deleteTerm(id: number): Promise<ApiResponse<boolean>>;
}

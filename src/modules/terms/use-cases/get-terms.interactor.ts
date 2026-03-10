import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Term } from "../entities/term";
import { TermRepository } from "./ports/term.repository";
import { GetTermsDto } from "../entities/get-terms.dto";

export class GetTermsInteractor implements UseCase<GetTermsDto, ApiResponse<Term[]>> {
  constructor(private readonly termRepository: TermRepository) {}

  async execute(payload?: GetTermsDto): Promise<ApiResponse<Term[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetTermsInteractor");
    }
    return this.termRepository.getTerms(payload.pagination);
  }
}

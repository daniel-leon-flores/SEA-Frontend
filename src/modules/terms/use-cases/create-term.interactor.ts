import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Term } from "../entities/term";
import { TermRepository } from "./ports/term.repository";
import { CreateTermDto } from "../entities/create-term.dto";

export class CreateTermInteractor implements UseCase<CreateTermDto, ApiResponse<Term>> {
  constructor(private readonly termRepository: TermRepository) {}

  async execute(payload?: CreateTermDto): Promise<ApiResponse<Term>> {
    if (!payload) {
      throw new Error("Missing payload for CreateTermInteractor");
    }
    return this.termRepository.createTerm(payload);
  }
}

import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { ExamRepository } from "./ports/exam.repository";
import { AssignExamDto } from "../entities/assign-exam.dto";

export class AssignExamInteractor implements UseCase<AssignExamDto, ApiResponse<unknown>> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(payload?: AssignExamDto): Promise<ApiResponse<unknown>> {
    if (!payload) {
      throw new Error("Missing payload for AssignExamInteractor");
    }
    return this.examRepository.assignExamToGroups(payload);
  }
}

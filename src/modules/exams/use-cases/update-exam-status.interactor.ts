import { ApiResponse } from "@/kernel/types";
import { ExamRepository } from "./ports/exam.repository";

export class UpdateExamStatusInteractor {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(id: number, status: boolean): Promise<ApiResponse<{ id_exam: number; status: boolean }>> {
    return this.examRepository.updateExamStatus(id, status);
  }
}

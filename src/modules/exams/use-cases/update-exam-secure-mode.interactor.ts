import { ApiResponse } from "@/kernel/types";
import { ExamRepository } from "./ports/exam.repository";

export class UpdateExamSecureModeInteractor {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(id: number, secure_mode: boolean): Promise<ApiResponse<{ id_exam: number; secure_mode: boolean }>> {
    return this.examRepository.updateExamSecureMode(id, secure_mode);
  }
}

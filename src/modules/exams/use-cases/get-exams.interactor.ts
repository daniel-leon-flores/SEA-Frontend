import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "./ports/exam.repository";
import { GetExamsDto } from "../entities/get-exams.dto";

export class GetExamsInteractor implements UseCase<GetExamsDto, ApiResponse<Exam[]>> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(payload?: GetExamsDto): Promise<ApiResponse<Exam[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetExamsInteractor");
    }
    return this.examRepository.getExams(payload.pagination, payload.status);
  }
}

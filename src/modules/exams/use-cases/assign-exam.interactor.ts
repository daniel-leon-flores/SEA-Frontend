import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "./ports/exam.repository";
import { AssignExamDto } from "../entities/assign-exam.dto";

export class AssignExamInteractor implements UseCase<AssignExamDto, ApiResponse<Exam>> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(payload?: AssignExamDto): Promise<ApiResponse<Exam>> {
    if (!payload) {
      throw new Error("Missing payload for AssignExamInteractor");
    }
    return this.examRepository.assignExam(payload);
  }
}

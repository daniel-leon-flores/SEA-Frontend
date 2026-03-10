import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "./ports/exam.repository";
import { CreateExamDto } from "../entities/create-exam.dto";

export class CreateExamInteractor implements UseCase<CreateExamDto, ApiResponse<Exam>> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(payload?: CreateExamDto): Promise<ApiResponse<Exam>> {
    if (!payload) {
      throw new Error("Missing payload for CreateExamInteractor");
    }
    return this.examRepository.createExam(payload);
  }
}

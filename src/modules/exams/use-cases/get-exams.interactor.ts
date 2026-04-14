import { UseCase } from "@/kernel/contract";
import { ApiResponse, PaginatedData } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "./ports/exam.repository";
import { GetExamsDto } from "../entities/get-exams.dto";

export class GetMyExamsInteractor implements UseCase<GetExamsDto, ApiResponse<PaginatedData<Exam>>> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(payload?: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>> {
    if (!payload) {
      throw new Error("Missing payload for GetMyExamsInteractor");
    }
    return this.examRepository.getMyExams(payload);
  }
}

export class GetAllExamsInteractor implements UseCase<GetExamsDto, ApiResponse<PaginatedData<Exam>>> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(payload?: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>> {
    if (!payload) {
      throw new Error("Missing payload for GetAllExamsInteractor");
    }
    return this.examRepository.getAllExams(payload);
  }
}

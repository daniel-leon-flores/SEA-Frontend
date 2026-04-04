import { ApiResponse } from "@/kernel/types";
import { MyAssignment, GetMyAssignmentsDto } from "../entities/my-assignment";
import { ExamRepository } from "./ports/exam.repository";

export class GetStudentAssignmentsInteractor {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(params?: GetMyAssignmentsDto): Promise<ApiResponse<MyAssignment[]>> {
    return this.examRepository.getStudentAssignments(params || {});
  }
}

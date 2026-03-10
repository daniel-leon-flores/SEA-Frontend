import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Subject } from "../entities/subject";
import { SubjectRepository } from "./ports/subject.repository";
import { GetSubjectsDto } from "../entities/get-subjects.dto";

export class GetSubjectsInteractor implements UseCase<GetSubjectsDto, ApiResponse<Subject[]>> {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async execute(payload?: GetSubjectsDto): Promise<ApiResponse<Subject[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetSubjectsInteractor");
    }
    return this.subjectRepository.getSubjects(payload.pagination, payload.teacherId);
  }
}

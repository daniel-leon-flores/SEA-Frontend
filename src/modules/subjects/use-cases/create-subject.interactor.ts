import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Subject } from "../entities/subject";
import { SubjectRepository } from "./ports/subject.repository";
import { CreateSubjectDto } from "../entities/create-subject.dto";

export class CreateSubjectInteractor implements UseCase<CreateSubjectDto, ApiResponse<Subject>> {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async execute(payload?: CreateSubjectDto): Promise<ApiResponse<Subject>> {
    if (!payload) {
      throw new Error("Missing payload for CreateSubjectInteractor");
    }
    return this.subjectRepository.createSubject(payload);
  }
}

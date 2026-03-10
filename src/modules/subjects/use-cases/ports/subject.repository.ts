import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Subject } from "../../entities/subject";
import { CreateSubjectDto } from "../../entities/create-subject.dto";

export interface SubjectRepository {
  getSubjects(pagination: PaginationDto, teacherId?: number): Promise<ApiResponse<Subject[]>>;
  getSubjectById(id: number): Promise<ApiResponse<Subject>>;
  createSubject(subject: CreateSubjectDto): Promise<ApiResponse<Subject>>;
  deleteSubject(id: number): Promise<ApiResponse<boolean>>;
}

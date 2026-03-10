import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Exam } from "../../entities/exam";
import { CreateExamDto } from "../../entities/create-exam.dto";
import { AssignExamDto } from "../../entities/assign-exam.dto";

export interface ExamRepository {
  getExams(pagination: PaginationDto, status?: string): Promise<ApiResponse<Exam[]>>;
  getExamById(id: number): Promise<ApiResponse<Exam>>;
  createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>>;
  assignExam(data: AssignExamDto): Promise<ApiResponse<Exam>>;
  deleteExam(id: number): Promise<ApiResponse<boolean>>;
}

import { ApiResponse, PaginatedData } from "@/kernel/types";
import { Exam } from "../../entities/exam";
import { GetExamsDto } from "../../entities/get-exams.dto";
import { CreateExamDto, UpdateExamDto } from "../../entities/create-exam.dto";
import {
  AssignExamDto,
  ExamGroupAssignment,
  AcademicGroup,
  Subject,
  GroupStats,
  GroupStudent,
  GetGroupStudentsDto,
} from "../../entities/assign-exam.dto";
import { MyAssignment, GetMyAssignmentsDto } from "../../entities/my-assignment";
import type { ExamQuestionsResponse, ReplaceExamQuestionsDto } from "../../entities/exam-linked-question";

export interface ExamRepository {
  getMyExams(params: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>>;
  getAllExams(params: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>>;
  getExamById(id: number): Promise<ApiResponse<Exam>>;
  createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>>;
  updateExam(id: number, exam: UpdateExamDto): Promise<ApiResponse<Exam>>;
  updateExamStatus(id: number, status: boolean): Promise<ApiResponse<{ id_exam: number; status: boolean }>>;
  updateExamSecureMode(id: number, secure_mode: boolean): Promise<ApiResponse<{ id_exam: number; secure_mode: boolean }>>;
  getExamAssignments(examId: number): Promise<ApiResponse<ExamGroupAssignment[]>>;
  assignExamToGroups(data: AssignExamDto): Promise<ApiResponse<unknown>>;
  getAcademicGroups(page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<AcademicGroup>>>;
  getAssignableGroups(): Promise<ApiResponse<AcademicGroup[]>>;
  getMySubjects(): Promise<ApiResponse<{ results: Subject[] }>>;
  getGroupStats(examId: number, groupId: number): Promise<ApiResponse<GroupStats>>;
  getGroupStudents(examId: number, groupId: number, params: GetGroupStudentsDto): Promise<ApiResponse<PaginatedData<GroupStudent>>>;
  getStudentAssignments(params: GetMyAssignmentsDto): Promise<ApiResponse<MyAssignment[]>>;
  getExamQuestions(examId: number): Promise<ApiResponse<ExamQuestionsResponse>>;
  putExamQuestions(examId: number, body: ReplaceExamQuestionsDto): Promise<ApiResponse<ExamQuestionsResponse>>;
}

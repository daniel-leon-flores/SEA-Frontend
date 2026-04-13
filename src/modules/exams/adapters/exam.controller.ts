import { ApiResponse, PaginatedData } from '@/kernel/types';
import { Exam } from '../entities/exam';
import { ExamRepository } from '../use-cases/ports/exam.repository';
import { ExamStorageGateway } from './exam.storage.gateway';
import { GetMyExamsInteractor, GetAllExamsInteractor } from '../use-cases/get-exams.interactor';
import { CreateExamDto, UpdateExamDto } from '../entities/create-exam.dto';
import { CreateExamInteractor } from '../use-cases/create-exam.interactor';
import { AssignExamInteractor } from '../use-cases/assign-exam.interactor';
import { UpdateExamStatusInteractor } from '../use-cases/update-exam-status.interactor';
import { UpdateExamSecureModeInteractor } from '../use-cases/update-exam-secure-mode.interactor';
import { GetStudentAssignmentsInteractor } from '../use-cases/get-student-assignments.interactor';
import { GetExamsDto } from '../entities/get-exams.dto';
import { MyAssignment, GetMyAssignmentsDto } from '../entities/my-assignment';
import type {
  AssignExamDto,
  ExamGroupAssignment,
  AcademicGroup,
  Subject,
  GroupStats,
  GroupStudent,
  GetGroupStudentsDto,
} from '../entities/assign-exam.dto';
import type { ExamQuestionsResponse, ReplaceExamQuestionsDto } from '../entities/exam-linked-question';

export class ExamController {
  private getRepository(): ExamRepository {
    return new ExamStorageGateway();
  }

  getMyExams(params: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>> {
    const interactor = new GetMyExamsInteractor(this.getRepository());
    return interactor.execute(params);
  }

  getAllExams(params: GetExamsDto): Promise<ApiResponse<PaginatedData<Exam>>> {
    const interactor = new GetAllExamsInteractor(this.getRepository());
    return interactor.execute(params);
  }

  getExamById(id: number): Promise<ApiResponse<Exam>> {
    return this.getRepository().getExamById(id);
  }

  createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>> {
    const interactor = new CreateExamInteractor(this.getRepository());
    return interactor.execute(exam);
  }

  updateExam(id: number, exam: UpdateExamDto): Promise<ApiResponse<Exam>> {
    return this.getRepository().updateExam(id, exam);
  }

  updateExamStatus(id: number, status: boolean): Promise<ApiResponse<{ id_exam: number; status: boolean }>> {
    const interactor = new UpdateExamStatusInteractor(this.getRepository());
    return interactor.execute(id, status);
  }

  updateExamSecureMode(id: number, secure_mode: boolean): Promise<ApiResponse<{ id_exam: number; secure_mode: boolean }>> {
    const interactor = new UpdateExamSecureModeInteractor(this.getRepository());
    return interactor.execute(id, secure_mode);
  }

  assignExamToGroups(data: AssignExamDto): Promise<ApiResponse<unknown>> {
    const interactor = new AssignExamInteractor(this.getRepository());
    return interactor.execute(data);
  }

  getExamAssignments(examId: number): Promise<ApiResponse<ExamGroupAssignment[]>> {
    return this.getRepository().getExamAssignments(examId);
  }

  getAcademicGroups(page?: number, pageSize?: number): Promise<ApiResponse<PaginatedData<AcademicGroup>>> {
    return this.getRepository().getAcademicGroups(page, pageSize);
  }

  getAssignableGroups(): Promise<ApiResponse<AcademicGroup[]>> {
    return this.getRepository().getAssignableGroups();
  }

  getMySubjects(): Promise<ApiResponse<{ results: Subject[] }>> {
    return this.getRepository().getMySubjects();
  }

  getGroupStats(examId: number, groupId: number): Promise<ApiResponse<GroupStats>> {
    return this.getRepository().getGroupStats(examId, groupId);
  }

  getGroupStudents(examId: number, groupId: number, params: GetGroupStudentsDto): Promise<ApiResponse<PaginatedData<GroupStudent>>> {
    return this.getRepository().getGroupStudents(examId, groupId, params);
  }

  getStudentAssignments(params?: GetMyAssignmentsDto): Promise<ApiResponse<MyAssignment[]>> {
    const interactor = new GetStudentAssignmentsInteractor(this.getRepository());
    return interactor.execute(params);
  }

  getExamQuestions(examId: number): Promise<ApiResponse<ExamQuestionsResponse>> {
    return this.getRepository().getExamQuestions(examId);
  }

  putExamQuestions(examId: number, body: ReplaceExamQuestionsDto): Promise<ApiResponse<ExamQuestionsResponse>> {
    return this.getRepository().putExamQuestions(examId, body);
  }

  exportGradesExcel(examId: number, groupId: number): Promise<Blob> {
    return this.getRepository().exportGradesExcel(examId, groupId);
  }

  exportGradesPDF(examId: number, groupId: number): Promise<Blob> {
    return this.getRepository().exportGradesPDF(examId, groupId);
  }
}

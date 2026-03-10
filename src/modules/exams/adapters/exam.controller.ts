import { ApiResponse, PaginationDto } from '@/kernel/types';
import { Exam } from '../entities/exam';
import { ExamRepository } from '../use-cases/ports/exam.repository';
import { ExamStorageGateway } from './exam.storage.gateway';
import { GetExamsInteractor } from '../use-cases/get-exams.interactor';
import { CreateExamDto } from '../entities/create-exam.dto';
import { CreateExamInteractor } from '../use-cases/create-exam.interactor';
import { AssignExamDto } from '../entities/assign-exam.dto';
import { AssignExamInteractor } from '../use-cases/assign-exam.interactor';

export class ExamController {
  getExams(pagination: PaginationDto, status?: string): Promise<ApiResponse<Exam[]>> {
    const repository: ExamRepository = new ExamStorageGateway();
    const interactor = new GetExamsInteractor(repository);
    return interactor.execute({ pagination, status });
  }

  createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>> {
    const repository: ExamRepository = new ExamStorageGateway();
    const interactor = new CreateExamInteractor(repository);
    return interactor.execute(exam);
  }

  assignExam(data: AssignExamDto): Promise<ApiResponse<Exam>> {
    const repository: ExamRepository = new ExamStorageGateway();
    const interactor = new AssignExamInteractor(repository);
    return interactor.execute(data);
  }
}

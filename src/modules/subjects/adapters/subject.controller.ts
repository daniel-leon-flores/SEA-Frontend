import { ApiResponse, PaginationDto } from '@/kernel/types';
import { Subject } from '../entities/subject';
import { SubjectRepository } from '../use-cases/ports/subject.repository';
import { SubjectStorageGateway } from './subject.storage.gateway';
import { GetSubjectsInteractor } from '../use-cases/get-subjects.interactor';
import { CreateSubjectDto } from '../entities/create-subject.dto';
import { CreateSubjectInteractor } from '../use-cases/create-subject.interactor';

export class SubjectController {
  getSubjects(pagination: PaginationDto, teacherId?: number): Promise<ApiResponse<Subject[]>> {
    const repository: SubjectRepository = new SubjectStorageGateway();
    const interactor = new GetSubjectsInteractor(repository);
    return interactor.execute({ pagination, teacherId });
  }

  createSubject(subject: CreateSubjectDto): Promise<ApiResponse<Subject>> {
    const repository: SubjectRepository = new SubjectStorageGateway();
    const interactor = new CreateSubjectInteractor(repository);
    return interactor.execute(subject);
  }
}

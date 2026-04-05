import type { ApiResponse } from '@/kernel/types';
import type { Subject, SubjectListPayload } from '../entities/subject';
import type { SubjectRepository } from '../use-cases/ports/subject.repository';
import { SubjectStorageGateway } from './subject.storage.gateway';
import { GetSubjectsInteractor } from '../use-cases/get-subjects.interactor';
import { CreateSubjectInteractor } from '../use-cases/create-subject.interactor';
import { UpdateSubjectInteractor } from '../use-cases/update-subject.interactor';
import { UpdateSubjectStatusInteractor } from '../use-cases/update-subject-status.interactor';
import type { CreateSubjectDto } from '../entities/create-subject.dto';
import type { UpdateSubjectDto } from '../entities/update-subject.dto';
import type { GetSubjectsDto } from '../entities/get-subjects.dto';

export class SubjectController {
  getSubjects(payload: GetSubjectsDto): Promise<ApiResponse<SubjectListPayload>> {
    const repository: SubjectRepository = new SubjectStorageGateway();
    const interactor = new GetSubjectsInteractor(repository);
    return interactor.execute(payload);
  }

  getSubjectById(id: number): Promise<ApiResponse<Subject>> {
    const repository: SubjectRepository = new SubjectStorageGateway();
    return repository.getSubjectById(id);
  }

  createSubject(subject: CreateSubjectDto): Promise<ApiResponse<Subject>> {
    const repository: SubjectRepository = new SubjectStorageGateway();
    const interactor = new CreateSubjectInteractor(repository);
    return interactor.execute(subject);
  }

  updateSubject(id: number, dto: UpdateSubjectDto): Promise<ApiResponse<Subject>> {
    const repository: SubjectRepository = new SubjectStorageGateway();
    const interactor = new UpdateSubjectInteractor(repository);
    return interactor.execute({ id, dto });
  }

  updateSubjectStatus(id: number, status: boolean): Promise<ApiResponse<{ id_subject: number; status: boolean }>> {
    const repository: SubjectRepository = new SubjectStorageGateway();
    const interactor = new UpdateSubjectStatusInteractor(repository);
    return interactor.execute({ id, status });
  }
}

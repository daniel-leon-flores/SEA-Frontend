import type { ApiResponse } from '@/kernel/types';
import type { Subject, SubjectListPayload } from '../entities/subject';
import type { SubjectRepository } from '../use-cases/ports/subject.repository';
import type { CreateSubjectDto } from '../entities/create-subject.dto';
import type { UpdateSubjectDto } from '../entities/update-subject.dto';
import type { GetSubjectsDto } from '../entities/get-subjects.dto';
import { subjectService } from './subject.service';

export class SubjectStorageGateway implements SubjectRepository {
  async getSubjects(payload: GetSubjectsDto): Promise<ApiResponse<SubjectListPayload>> {
    const { pagination, academic_level, status, name } = payload;
    return subjectService.list({
      page: pagination.page,
      page_size: pagination.limit,
      academic_level: academic_level ?? undefined,
      status: status ?? undefined,
      name: name ?? undefined,
    });
  }

  async getSubjectById(id: number): Promise<ApiResponse<Subject>> {
    return subjectService.getById(id);
  }

  async createSubject(subject: CreateSubjectDto): Promise<ApiResponse<Subject>> {
    return subjectService.create(subject);
  }

  async updateSubject(id: number, subject: UpdateSubjectDto): Promise<ApiResponse<Subject>> {
    return subjectService.update(id, subject);
  }

  async updateSubjectStatus(id: number, status: boolean): Promise<ApiResponse<{ id_subject: number; status: boolean }>> {
    return subjectService.patchStatus(id, status);
  }
}

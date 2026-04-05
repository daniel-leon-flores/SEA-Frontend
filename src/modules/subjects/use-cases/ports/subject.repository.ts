import type { ApiResponse } from '@/kernel/types';
import type { Subject, SubjectListPayload } from '../../entities/subject';
import type { CreateSubjectDto } from '../../entities/create-subject.dto';
import type { UpdateSubjectDto } from '../../entities/update-subject.dto';
import type { GetSubjectsDto } from '../../entities/get-subjects.dto';

export interface SubjectRepository {
  getSubjects(payload: GetSubjectsDto): Promise<ApiResponse<SubjectListPayload>>;
  getSubjectById(id: number): Promise<ApiResponse<Subject>>;
  createSubject(subject: CreateSubjectDto): Promise<ApiResponse<Subject>>;
  updateSubject(id: number, subject: UpdateSubjectDto): Promise<ApiResponse<Subject>>;
  updateSubjectStatus(id: number, status: boolean): Promise<ApiResponse<{ id_subject: number; status: boolean }>>;
}

import { handleRequest } from '@/config/http-client.gateway';
import type { ApiResponse } from '@/kernel/types';
import type { Subject, SubjectListPayload } from '../entities/subject';
import type { CreateSubjectDto } from '../entities/create-subject.dto';
import type { UpdateSubjectDto } from '../entities/update-subject.dto';

export type ListSubjectsQuery = {
  page?: number;
  page_size?: number;
  academic_level?: number;
  status?: boolean;
  name?: string;
};

export type SubjectStatusBody = { id_subject: number; status: boolean };

/**
 * HTTP layer for /api/academic/subjects/* (SEA-api apps.academic.urls).
 */
export const subjectService = {
  list(query: ListSubjectsQuery): Promise<ApiResponse<SubjectListPayload>> {
    const params = new URLSearchParams();
    if (query.page != null) params.set('page', String(query.page));
    if (query.page_size != null) params.set('page_size', String(query.page_size));
    if (query.academic_level != null) params.set('academic_level', String(query.academic_level));
    if (query.status !== undefined) params.set('status', String(query.status));
    if (query.name) params.set('name', query.name);
    const qs = params.toString();
    const endpoint = qs ? `/api/academic/subjects/?${qs}` : '/api/academic/subjects/';
    return handleRequest<SubjectListPayload>('get', endpoint);
  },

  getById(id: number): Promise<ApiResponse<Subject>> {
    return handleRequest<Subject>('get', `/api/academic/subjects/${id}/`);
  },

  create(body: CreateSubjectDto): Promise<ApiResponse<Subject>> {
    return handleRequest<Subject, CreateSubjectDto>('post', '/api/academic/subjects/', body);
  },

  update(id: number, body: UpdateSubjectDto): Promise<ApiResponse<Subject>> {
    return handleRequest<Subject, UpdateSubjectDto>('put', `/api/academic/subjects/${id}/`, body);
  },

  patchStatus(id: number, status: boolean): Promise<ApiResponse<SubjectStatusBody>> {
    return handleRequest<SubjectStatusBody, { status: boolean }>(
      'patch',
      `/api/academic/subjects/${id}/status/`,
      { status },
    );
  },
};

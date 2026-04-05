import type { Entity } from '@/kernel/types';

/** Unit as returned by GET /api/academic/subjects/ */
export type SubjectUnit = {
  id_unit: number;
  id_subject: number;
  unit_name: string;
  unit_number: number;
};

/** Subject — matches SubjectSerializer (apps/academic/serializers.py) */
export type Subject = Entity<number> & {
  id_subject: number;
  name: string;
  level_number: number;
  units: SubjectUnit[];
  status: boolean;
};

/** Paginated list payload inside ApiResponse.data */
export type SubjectListPayload = {
  results: Subject[];
  pagination: {
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  };
};

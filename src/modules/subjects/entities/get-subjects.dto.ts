import type { PaginationDto } from '@/kernel/types';

export interface GetSubjectsDto {
  pagination: PaginationDto;
  /** Filter by level_number (query: academic_level) */
  academic_level?: number;
  /** Omit = no filter; true/false = filter by status */
  status?: boolean | null;
  /** Filter by name (partial match, case-insensitive) */
  name?: string;
}

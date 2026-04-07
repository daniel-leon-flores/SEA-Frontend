import { PaginationDto } from '@/kernel/types';

export interface GetQuestionsDto {
  pagination: PaginationDto;
  subjectId?: number;
  difficulty?: string;
  /** MULTIPLE_CHOICE | MULTIPLE_SELECTION | OPEN | CODE */
  type?: string;
}

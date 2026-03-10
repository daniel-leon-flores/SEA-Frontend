import { PaginationDto } from "@/kernel/types";

export interface GetQuestionsDto {
  pagination: PaginationDto;
  subjectId?: number;
  difficulty?: string;
}

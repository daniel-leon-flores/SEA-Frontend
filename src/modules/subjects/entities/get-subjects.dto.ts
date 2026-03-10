import { PaginationDto } from "@/kernel/types";

export interface GetSubjectsDto {
  pagination: PaginationDto;
  teacherId?: number;
}

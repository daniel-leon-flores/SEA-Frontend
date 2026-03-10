import { PaginationDto } from "@/kernel/types";

export interface GetExamsDto {
  pagination: PaginationDto;
  status?: string;
}

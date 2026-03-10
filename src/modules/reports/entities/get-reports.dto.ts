import { PaginationDto } from "@/kernel/types";

export interface GetReportsDto {
  pagination: PaginationDto;
  type?: string;
}

import { PaginationDto } from "@/kernel/types";

export interface GetGroupsDto {
  pagination: PaginationDto;
  termId?: number;
}

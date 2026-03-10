import { PaginationDto } from "@/kernel/types";

export interface GetUsersDto {
  pagination: PaginationDto;
  role?: string;
  status?: string;
}

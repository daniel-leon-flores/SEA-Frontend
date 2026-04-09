import { ApiResponse, PaginationDto } from "@/kernel/types";
import { User } from "../../entities/user";
import { CreateUserDto } from "../../entities/create-user.dto";
import { UpdateUserDto } from "../../entities/update-user.dto";

export type EligibleGroupAssignment = {
  id_assignment: number;
  subject: { id_subject: number; name: string };
  teacher: { id_teacher: number; full_name: string };
};

export type EligibleGroup = {
  id_group: number;
  group_letter: string;
  academic_level: number;
  generation_year: number;
  id_generation: number;
  subjects_at_level: string[];
  assignments: EligibleGroupAssignment[];
};

export interface UserRepository {
  getUsers(pagination: PaginationDto, role?: string, status?: string): Promise<ApiResponse<User[]>>;
  getUserById(id: number): Promise<ApiResponse<User>>;
  createUser(user: CreateUserDto): Promise<ApiResponse<User>>;
  updateUser(id: number, user: UpdateUserDto): Promise<ApiResponse<User>>;
  updateUserStatus(id: number, status: boolean): Promise<ApiResponse<{ id_user: number; status: boolean }>>;
  deleteUser(id: number): Promise<ApiResponse<boolean>>;
  getEligibleGroups(userId: number): Promise<ApiResponse<{ results: EligibleGroup[] }>>;
}

import { ApiResponse, PaginationDto } from "@/kernel/types";
import { User } from "../../entities/user";
import { CreateUserDto } from "../../entities/create-user.dto";

export interface UserRepository {
  getUsers(pagination: PaginationDto, role?: string, status?: string): Promise<ApiResponse<User[]>>;
  getUserById(id: number): Promise<ApiResponse<User>>;
  createUser(user: CreateUserDto): Promise<ApiResponse<User>>;
  deleteUser(id: number): Promise<ApiResponse<boolean>>;
}

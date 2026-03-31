import { ApiResponse, PaginationDto } from "@/kernel/types";
import { User } from "../../entities/user";
import { CreateUserDto } from "../../entities/create-user.dto";
import { UpdateUserDto } from "../../entities/update-user.dto";

export interface UserRepository {
  getUsers(pagination: PaginationDto, role?: string, status?: string): Promise<ApiResponse<User[]>>;
  getUserById(id: number): Promise<ApiResponse<User>>;
  createUser(user: CreateUserDto): Promise<ApiResponse<User>>;
  updateUser(id: number, user: UpdateUserDto): Promise<ApiResponse<User>>;
  updateUserStatus(id: number, status: boolean): Promise<ApiResponse<{ id_user: number; status: boolean }>>;
  deleteUser(id: number): Promise<ApiResponse<boolean>>;
}

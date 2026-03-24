import { ApiResponse, PaginationDto } from "@/kernel/types";
import { User } from "../entities/user";
import { UserRepository } from "../use-cases/ports/user.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateUserDto } from "../entities/create-user.dto";

export class UserStorageGateway implements UserRepository {
  async getUsers(pagination: PaginationDto, role?: string, status?: string): Promise<ApiResponse<User[]>> {
    return handleRequest<User[], PaginationDto>('post', `/api/users/paged?role=${role || ''}&status=${status || ''}`, pagination);
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return handleRequest<User>('get', `/api/users/${id}`);
  }

  async createUser(user: CreateUserDto): Promise<ApiResponse<User>> {
    return handleRequest<User, CreateUserDto>('post', '/api/users/register/', user);
  }

  async deleteUser(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/users/${id}`);
  }
}

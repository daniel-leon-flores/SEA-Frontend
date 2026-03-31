import { ApiResponse, PaginationDto } from "@/kernel/types";
import { User } from "../entities/user";
import { UserRepository } from "../use-cases/ports/user.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateUserDto } from "../entities/create-user.dto";
import { UpdateUserDto } from "../entities/update-user.dto";

export class UserStorageGateway implements UserRepository {
  async getUsers(pagination: PaginationDto, role?: string, status?: string): Promise<ApiResponse<User[]>> {
    // Construir los query params para la paginación del backend
    const params = new URLSearchParams();
    
    if (pagination.page) {
      params.append('page', pagination.page.toString());
    }
    
    if (pagination.limit) {
      params.append('page_size', pagination.limit.toString());
    }
    
    if (role) {
      params.append('role', role);
    }
    
    if (status) {
      params.append('status', status);
    }
    
    if (pagination.filter) {
      params.append('search', pagination.filter);
    }
    
    const queryString = params.toString();
    const url = `/api/users/${queryString ? '?' + queryString : ''}`;
    
    return handleRequest<User[]>('get', url);
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return handleRequest<User>('get', `/api/users/${id}/`);
  }

  async createUser(user: CreateUserDto): Promise<ApiResponse<User>> {
    return handleRequest<User, CreateUserDto>('post', '/api/users/', user);
  }

  async updateUser(id: number, user: UpdateUserDto): Promise<ApiResponse<User>> {
    return handleRequest<User, UpdateUserDto>('put', `/api/users/${id}/`, user);
  }

  async updateUserStatus(id: number, status: boolean): Promise<ApiResponse<{ id_user: number; status: boolean }>> {
    return handleRequest<{ id_user: number; status: boolean }, { status: boolean }>(
      'patch', 
      `/api/users/${id}/status/`, 
      { status }
    );
  }

  async deleteUser(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/users/${id}/`);
  }
}

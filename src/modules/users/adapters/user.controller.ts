import { ApiResponse, PaginationDto } from '@/kernel/types';
import { User } from '../entities/user';
import { UserRepository } from '../use-cases/ports/user.repository';
import { UserStorageGateway } from './user.storage.gateway';
import { GetUsersInteractor } from '../use-cases/get-users.interactor';
import { CreateUserDto } from '../entities/create-user.dto';
import { CreateUserInteractor } from '../use-cases/create-user.interactor';

export class UserController {
  getUsers(pagination: PaginationDto, role?: string, status?: string): Promise<ApiResponse<User[]>> {
    const repository: UserRepository = new UserStorageGateway();
    const interactor = new GetUsersInteractor(repository);
    return interactor.execute({ pagination, role, status });
  }

  createUser(user: CreateUserDto): Promise<ApiResponse<User>> {
    const repository: UserRepository = new UserStorageGateway();
    const interactor = new CreateUserInteractor(repository);
    return interactor.execute(user);
  }
}

import { ApiResponse } from '@/kernel/types';
import { User } from '../entities/user';
import { UserRepository } from '../use-cases/ports/user.repository';
import { UserStorageGateway } from './user.storage.gateway';
import { GetUsersInteractor } from '../use-cases/get-users.interactor';
import { CreateUserDto } from '../entities/create-user.dto';
import { CreateUserInteractor } from '../use-cases/create-user.interactor';
import { GetUsersDto } from '../entities/get-users.dto';

export class UserController {
  getUsers(payload: GetUsersDto): Promise<ApiResponse<User[]>> {
    const repository: UserRepository = new UserStorageGateway();
    const interactor = new GetUsersInteractor(repository);
    return interactor.execute(payload);
  }

  createUser(user: CreateUserDto): Promise<ApiResponse<User>> {
    const repository: UserRepository = new UserStorageGateway();
    const interactor = new CreateUserInteractor(repository);
    return interactor.execute(user);
  }
}

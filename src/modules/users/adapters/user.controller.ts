import { ApiResponse } from '@/kernel/types';
import { User } from '../entities/user';
import { UserRepository, EligibleGroup } from '../use-cases/ports/user.repository';
import { UserStorageGateway } from './user.storage.gateway';
import { GetUsersInteractor } from '../use-cases/get-users.interactor';
import { CreateUserDto } from '../entities/create-user.dto';
import { UpdateUserDto } from '../entities/update-user.dto';
import { CreateUserInteractor } from '../use-cases/create-user.interactor';
import { UpdateUserInteractor } from '../use-cases/update-user.interactor';
import { UpdateUserStatusInteractor } from '../use-cases/update-user-status.interactor';
import { GetEligibleGroupsInteractor } from '../use-cases/get-eligible-groups.interactor';
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

  updateUser(id: number, user: UpdateUserDto): Promise<ApiResponse<User>> {
    const repository: UserRepository = new UserStorageGateway();
    const interactor = new UpdateUserInteractor(repository);
    return interactor.execute(id, user);
  }

  updateUserStatus(id: number, status: boolean): Promise<ApiResponse<{ id_user: number; status: boolean }>> {
    const repository: UserRepository = new UserStorageGateway();
    const interactor = new UpdateUserStatusInteractor(repository);
    return interactor.execute(id, status);
  }

  getEligibleGroups(userId: number): Promise<ApiResponse<{ results: EligibleGroup[] }>> {
    const repository: UserRepository = new UserStorageGateway();
    const interactor = new GetEligibleGroupsInteractor(repository);
    return interactor.execute(userId);
  }
}

import { ApiResponse } from '@/kernel/types';
import { User } from '../entities/user';
import { UpdateUserDto } from '../entities/update-user.dto';
import { UserRepository } from './ports/user.repository';

export class UpdateUserInteractor {
  constructor(private repository: UserRepository) {}

  async execute(id: number, user: UpdateUserDto): Promise<ApiResponse<User>> {
    return this.repository.updateUser(id, user);
  }
}

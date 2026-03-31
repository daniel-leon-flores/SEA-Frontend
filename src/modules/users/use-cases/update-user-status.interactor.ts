import { ApiResponse } from '@/kernel/types';
import { UserRepository } from './ports/user.repository';

export class UpdateUserStatusInteractor {
  constructor(private repository: UserRepository) {}

  async execute(id: number, status: boolean): Promise<ApiResponse<{ id_user: number; status: boolean }>> {
    return this.repository.updateUserStatus(id, status);
  }
}

import { ApiResponse } from '@/kernel/types';
import { UserRepository, EligibleGroup } from './ports/user.repository';

export class GetEligibleGroupsInteractor {
  constructor(private readonly repository: UserRepository) {}

  execute(userId: number): Promise<ApiResponse<{ results: EligibleGroup[] }>> {
    return this.repository.getEligibleGroups(userId);
  }
}

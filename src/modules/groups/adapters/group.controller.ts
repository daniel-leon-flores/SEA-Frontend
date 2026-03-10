import { ApiResponse, PaginationDto } from '@/kernel/types';
import { Group } from '../entities/group';
import { GroupRepository } from '../use-cases/ports/group.repository';
import { GroupStorageGateway } from './group.storage.gateway';
import { GetGroupsInteractor } from '../use-cases/get-groups.interactor';
import { CreateGroupDto } from '../entities/create-group.dto';
import { CreateGroupInteractor } from '../use-cases/create-group.interactor';

export class GroupController {
  getGroups(pagination: PaginationDto, termId?: number): Promise<ApiResponse<Group[]>> {
    const repository: GroupRepository = new GroupStorageGateway();
    const interactor = new GetGroupsInteractor(repository);
    return interactor.execute({ pagination, termId });
  }

  createGroup(group: CreateGroupDto): Promise<ApiResponse<Group>> {
    const repository: GroupRepository = new GroupStorageGateway();
    const interactor = new CreateGroupInteractor(repository);
    return interactor.execute(group);
  }
}

import { CreateGenerationGroupInteractor } from '../use-cases/create-generation-group.interactor';
import { DeleteGenerationGroupInteractor } from '../use-cases/delete-generation-group.interactor';
import { GetGenerationGroupsInteractor } from '../use-cases/get-generation-groups.interactor';
import { SetGenerationGroupStatusInteractor } from '../use-cases/set-generation-group-status.interactor';
import { UpdateGenerationGroupInteractor } from '../use-cases/update-generation-group.interactor';
import { CreateAssignmentInteractor } from '../use-cases/assign-teacher.interactor';
import { DeleteAssignmentInteractor } from '../use-cases/delete-assignment.interactor';
import { GetAvailableTeachersInteractor } from '../use-cases/get-available-teachers.interactor';
import { GenerationGroupStorageGateway } from './generation-group.storage.gateway';

const generationGroupRepository = new GenerationGroupStorageGateway();

export const createGenerationGroupInteractor = new CreateGenerationGroupInteractor(generationGroupRepository);
export const deleteGenerationGroupInteractor = new DeleteGenerationGroupInteractor(generationGroupRepository);
export const getGenerationGroupsInteractor = new GetGenerationGroupsInteractor(generationGroupRepository);
export const setGenerationGroupStatusInteractor = new SetGenerationGroupStatusInteractor(generationGroupRepository);
export const updateGenerationGroupInteractor = new UpdateGenerationGroupInteractor(generationGroupRepository);
export const createAssignmentInteractor = new CreateAssignmentInteractor(generationGroupRepository);
export const deleteAssignmentInteractor = new DeleteAssignmentInteractor(generationGroupRepository);
export const getAvailableTeachersInteractor = new GetAvailableTeachersInteractor(generationGroupRepository);

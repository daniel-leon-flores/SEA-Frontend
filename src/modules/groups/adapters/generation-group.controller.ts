import { CreateGenerationGroupInteractor } from '../use-cases/create-generation-group.interactor';
import { DeleteGenerationGroupInteractor } from '../use-cases/delete-generation-group.interactor';
import { GetGenerationGroupsInteractor } from '../use-cases/get-generation-groups.interactor';
import { SetGenerationGroupStatusInteractor } from '../use-cases/set-generation-group-status.interactor';
import { UpdateGenerationGroupInteractor } from '../use-cases/update-generation-group.interactor';
import { GenerationGroupStorageGateway } from './generation-group.storage.gateway';

const generationGroupRepository = new GenerationGroupStorageGateway();

export const createGenerationGroupInteractor = new CreateGenerationGroupInteractor(generationGroupRepository);
export const deleteGenerationGroupInteractor = new DeleteGenerationGroupInteractor(generationGroupRepository);
export const getGenerationGroupsInteractor = new GetGenerationGroupsInteractor(generationGroupRepository);
export const setGenerationGroupStatusInteractor = new SetGenerationGroupStatusInteractor(generationGroupRepository);
export const updateGenerationGroupInteractor = new UpdateGenerationGroupInteractor(generationGroupRepository);

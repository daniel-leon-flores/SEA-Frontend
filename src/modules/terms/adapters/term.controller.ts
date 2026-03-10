import { ApiResponse, PaginationDto } from '@/kernel/types';
import { Term } from '../entities/term';
import { TermRepository } from '../use-cases/ports/term.repository';
import { TermStorageGateway } from './term.storage.gateway';
import { GetTermsInteractor } from '../use-cases/get-terms.interactor';
import { CreateTermDto } from '../entities/create-term.dto';
import { CreateTermInteractor } from '../use-cases/create-term.interactor';

export class TermController {
  getTerms(pagination: PaginationDto): Promise<ApiResponse<Term[]>> {
    const repository: TermRepository = new TermStorageGateway();
    const interactor = new GetTermsInteractor(repository);
    return interactor.execute({ pagination });
  }

  createTerm(term: CreateTermDto): Promise<ApiResponse<Term>> {
    const repository: TermRepository = new TermStorageGateway();
    const interactor = new CreateTermInteractor(repository);
    return interactor.execute(term);
  }
}

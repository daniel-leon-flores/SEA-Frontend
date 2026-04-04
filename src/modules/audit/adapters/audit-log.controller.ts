import { PaginationDto } from '@/kernel/types';
import { AuditLogPaginatedResponse } from '../entities/audit-log';
import { AuditLogStorageGateway } from './audit-log.storage.gateway';
import { AuditLogRepository } from '../use-cases/ports/audit-log.repository';
import { GetAuditLogsInteractor } from '../use-cases/get-audit-logs.interactor';

export class AuditLogController {
  getAuditLogs(
    pagination: PaginationDto,
    operationType?: 'INSERT' | 'UPDATE' | 'DELETE' | 'Creación' | 'Actualización' | 'Eliminación',
  ): Promise<AuditLogPaginatedResponse> {
    const repository: AuditLogRepository = new AuditLogStorageGateway();
    const interactor = new GetAuditLogsInteractor(repository);

    return interactor.execute({
      pagination,
      operationType,
    });
  }
}

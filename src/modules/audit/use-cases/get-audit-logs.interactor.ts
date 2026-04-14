import { UseCase } from '@/kernel/types';
import { AuditLogPaginatedResponse } from '../entities/audit-log';
import { GetAuditLogsDto } from '../entities/get-audit-logs.dto';
import { AuditLogRepository } from './ports/audit-log.repository';

export class GetAuditLogsInteractor implements UseCase<GetAuditLogsDto, AuditLogPaginatedResponse> {
  constructor(private readonly repository: AuditLogRepository) {}

  async execute(payload?: GetAuditLogsDto): Promise<AuditLogPaginatedResponse> {
    if (!payload) {
      throw new Error('Missing payload for GetAuditLogsInteractor');
    }

    return this.repository.getAuditLogs(
      payload.pagination,
      payload.tableName,
      payload.operationType,
    );
  }
}

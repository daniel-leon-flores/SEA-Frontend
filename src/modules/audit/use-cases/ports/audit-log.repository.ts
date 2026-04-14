import { AuditLogPaginatedResponse } from '../../entities/audit-log';
import { PaginationDto } from '@/kernel/types';

export interface AuditLogRepository {
  getAuditLogs(
    pagination: PaginationDto,
    tableName?: string,
    operationType?: 'INSERT' | 'UPDATE' | 'DELETE' | 'Creación' | 'Actualización' | 'Eliminación',
  ): Promise<AuditLogPaginatedResponse>;
}

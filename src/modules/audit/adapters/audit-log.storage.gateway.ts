import { handleRequest } from '@/config/http-client.gateway';
import { ApiResponse, PaginationDto } from '@/kernel/types';
import { AuditLogPaginatedResponse } from '../entities/audit-log';
import { AuditLogRepository } from '../use-cases/ports/audit-log.repository';

export class AuditLogStorageGateway implements AuditLogRepository {
  async getAuditLogs(
    pagination: PaginationDto,
    tableName?: string,
    operationType?: 'INSERT' | 'UPDATE' | 'DELETE' | 'Creación' | 'Actualización' | 'Eliminación',
  ): Promise<AuditLogPaginatedResponse> {
    const params = new URLSearchParams();

    if (pagination.page) {
      params.append('page', String(pagination.page));
    }

    if (pagination.limit) {
      params.append('page_size', String(pagination.limit));
    }

    if (tableName) {
      params.append('table_name', tableName);
    }

    if (operationType) {
      const operationToBackend: Record<string, string> = {
        'Creación': 'INSERT',
        'Actualización': 'UPDATE',
        'Eliminación': 'DELETE',
        INSERT: 'INSERT',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE',
      };
      params.append('operation_type', operationToBackend[operationType] || operationType);
    }

    const queryString = params.toString();
    const endpoint = `/api/audit-logs/${queryString ? `?${queryString}` : ''}`;

    const response = await handleRequest<AuditLogPaginatedResponse>('get', endpoint);
    const maybePaginated = response as unknown as AuditLogPaginatedResponse;

    if (Array.isArray(maybePaginated.results)) {
      return maybePaginated;
    }

    const wrapped = response as ApiResponse<AuditLogPaginatedResponse>;
    if (wrapped.success && wrapped.data && Array.isArray(wrapped.data.results)) {
      return wrapped.data;
    }

    throw new Error('No se pudo obtener la bitácora de auditoría.');
  }
}

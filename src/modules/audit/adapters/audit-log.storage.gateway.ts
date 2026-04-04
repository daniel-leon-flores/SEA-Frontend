import { handleRequest } from '@/config/http-client.gateway';
import { PaginationDto } from '@/kernel/types';
import { AuditLogPaginatedResponse } from '../entities/audit-log';
import { AuditLogRepository } from '../use-cases/ports/audit-log.repository';

export class AuditLogStorageGateway implements AuditLogRepository {
  private buildOperationQuery(operationType: 'INSERT' | 'UPDATE' | 'DELETE' | 'Creación' | 'Actualización' | 'Eliminación'): string {
    const operationMap: Record<string, string> = {
      'Creación': 'INSERT',
      'Actualización': 'UPDATE',
      'Eliminación': 'DELETE',
      INSERT: 'INSERT',
      UPDATE: 'UPDATE',
      DELETE: 'DELETE',
    };
    return operationMap[operationType] || operationType;
  }

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
      const backendOperation = this.buildOperationQuery(operationType);
      params.append('operation_type', backendOperation);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/api/audit-logs?${queryString}` : '/api/audit-logs';

    const response = await handleRequest<AuditLogPaginatedResponse>('get', endpoint);

    if (this.isAuditLogPaginatedResponse(response)) {
      return response;
    }

    throw new Error('No se pudo obtener la bitácora de auditoría.');
  }

  private isAuditLogPaginatedResponse(response: unknown): response is AuditLogPaginatedResponse {
    return typeof response === 'object' && response !== null && 'results' in response && Array.isArray((response as any).results);
  }
}

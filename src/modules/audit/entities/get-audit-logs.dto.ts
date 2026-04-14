import { PaginationDto } from '@/kernel/types';

export interface GetAuditLogsDto {
  pagination: PaginationDto;
  tableName?: string;
  operationType?: 'INSERT' | 'UPDATE' | 'DELETE' | 'Creación' | 'Actualización' | 'Eliminación';
}

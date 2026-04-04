export type AuditLogOperation = 'Creación' | 'Actualización' | 'Eliminación' | string;

export interface AuditChange {
  field: string;
  old: unknown;
  new: unknown;
}

export interface AuditLog {
  table: string;
  operation: AuditLogOperation;
  changed_at: string;
  user: string;
  changes: AuditChange[];
}

export interface AuditLogPaginatedResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

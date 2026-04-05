export type Entity<Tidentifier extends number | string> = {
  id?: Tidentifier;
};

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
  data?: T;
  /** Errores detallados del backend (p. ej. DRF), si vienen en el cuerpo. */
  errors?: Record<string, unknown>;
  error?: {
    message: string;
    details?: any;
  };
}

export interface PaginatedData<T = any> {
  results: T[];
  pagination: {
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  };
}

export enum TypesResponse {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}

export type PaginationDto = {
  filter?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
};

export interface UseCase<TInput, TOutput> {
  execute(input?: TInput): Promise<TOutput>;
}

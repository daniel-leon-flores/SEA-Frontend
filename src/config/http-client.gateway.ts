import AxiosClient from './axios';
import { AxiosRequestConfig } from 'axios';
import { getApiErrorMessage } from '@/kernel/api-error-message';
import { ApiResponse } from "@/kernel/types";

// Variable para controlar el refresh en progreso
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
AxiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sea_token');
    const activeRole = localStorage.getItem('sea_selectedRole');

    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (activeRole) config.headers['X-Active-Role'] = activeRole;

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles token refresh on 401
AxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    // Si es 401 y no es un intento de refresh y no hemos reintentado ya
    // EXCLUIR endpoints de autenticación que pueden devolver 401 por validación (no por token expirado)
    const excludedEndpoints = [
      '/auth/login/',
      '/auth/refresh/', 
      '/auth/change-password/',
      '/users/password-recovery/request/',
      '/users/password-recovery/verify/',
      '/users/password-recovery/reset/'
    ];
    const isExcludedEndpoint = excludedEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );
    
    if (status === 401 && !isExcludedEndpoint && !originalRequest._retry) {
      
      if (isRefreshing) {
        // Si ya está en proceso de refresh, agregar a la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return AxiosClient(originalRequest);
          })
          .catch(err => {
            throw err;
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('sea_refresh');

      if (!refreshToken) {
        // No hay refresh token, limpiar y redirigir
        isRefreshing = false;
        processQueue(new Error('No refresh token'), null);
        localStorage.clear();

        globalThis.location.href = '/login';

        throw error;
      }

      try {
        // Intentar refrescar el token
        const { data } = await AxiosClient.post('/api/auth/refresh/', { refresh: refreshToken });

        const newAccessToken = data.access;

        // Actualizar token en localStorage
        localStorage.setItem('sea_token', newAccessToken);

        // Si el backend devuelve un nuevo refresh token, actualizarlo
        if (data.refresh) {
          localStorage.setItem('sea_refresh', data.refresh);
        }

        // Actualizar el header de la petición original
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Procesar la cola de peticiones pendientes
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Reintentar la petición original con el nuevo token
        return AxiosClient(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpia y redirige al login
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('sea_token');
        localStorage.removeItem('sea_refresh');
        localStorage.removeItem('sea_selectedRole');
        localStorage.removeItem('sea_userName');

        globalThis.location.href = '/login';

        throw refreshError;
      }
    }

    // Si es 403, redirigir a no autorizado excepto en reportes,
    // donde la UI necesita mostrar mensajes de error de negocio.
    const isReportsEndpoint = originalRequest?.url?.includes('/api/reports/');
    if (status === 403 && !isReportsEndpoint) {
      globalThis.location.href = '/unauthorized';
    }

    throw error;
  }
);

export default {
  get(endpoint: string) {
    return AxiosClient.get(endpoint);
  },
  getBlob(endpoint: string) {
    return AxiosClient.get(endpoint, { responseType: 'blob' });
  },
  post(endpoint: string, payload: any, config?: AxiosRequestConfig) {
    return AxiosClient.post(endpoint, payload, config);
  },
  postBlob(endpoint: string, payload: any) {
    return AxiosClient.post(endpoint, payload, { responseType: 'blob' });
  },
  put(endpoint: string, payload: any) {
    return AxiosClient.put(endpoint, payload);
  },
  patch(endpoint: string, payload: any) {
    return AxiosClient.patch(endpoint, payload);
  },
  delete(endpoint: string, payload: any, config?: AxiosRequestConfig) {
    return AxiosClient.delete(endpoint, {
      ...config,
      data: payload,
    });
  }
}

export async function handleRequest<T, P = undefined>(
  method: "post" | "put" | "get" | "delete" | "patch",
  url: string,
  payload?: P,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const requestConfig = config || {};
    const { data: apiResponse } = await (AxiosClient as any)[method](url, payload, requestConfig);
    return apiResponse as ApiResponse<T>;
  } catch (error: any) {
    const raw = error.response?.data;
    if (raw && typeof raw === 'object') {
      const mergedMessage = getApiErrorMessage(raw);
      const base = raw as ApiResponse<T>;
      return {
        ...base,
        success: false,
        code: error.response?.status ?? base.code ?? 500,
        message: mergedMessage,
        timestamp: base.timestamp ?? new Date().toISOString(),
        errors: (raw as ApiResponse<T>).errors,
        error: {
          message: mergedMessage,
          details: (raw as ApiResponse<T>).errors ?? base.error?.details,
        },
      };
    }
    return {
      success: false,
      code: error.response?.status || 500,
      message: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
      timestamp: new Date().toISOString(),
      error: {
        message: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        details: error.response?.data?.error?.details
      }
    };
  }
}

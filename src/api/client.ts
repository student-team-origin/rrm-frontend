import axios, { AxiosError } from 'axios';
import type { components } from './schema';

/** Corpul erorilor întoarse de backend (schema `Error` din openapi.yaml). */
export type ApiError = components['schemas']['Error'];

/** Cheia sub care se păstrează tokenul JWT (în sessionStorage, conform TO-1). */
export const TOKEN_STORAGE_KEY = 'rrm.token';

/** Instanța Axios folosită de toate apelurile către backend. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      // Sesiune expirată sau token invalid. Redirecționarea la /login se adaugă odată cu TO-1.
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

const FALLBACK_ERROR: ApiError = {
  code: 'EROARE_RETEA',
  message: 'Serverul nu răspunde. Verifică conexiunea și încearcă din nou.',
};

/**
 * Extrage eroarea standard a backend-ului dintr-o eroare Axios, pentru afișare în interfață.
 *
 * @example
 * const { message, fields } = toApiError(mutation.error);
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const data: unknown = error.response?.data;
    if (isApiError(data)) {
      return data;
    }
  }
  return FALLBACK_ERROR;
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).code === 'string' &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}

/** Codul HTTP al unei erori de la backend (ex. 404, 409) sau `undefined` dacă nu există răspuns. */
export function getHttpStatus(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined;
}

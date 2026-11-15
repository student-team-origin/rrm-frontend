import axios, { AxiosError } from 'axios';
import type { components } from './schema';

/** Corpul erorilor întoarse de backend (schema `Error` din openapi.yaml). */
export type ApiError = components['schemas']['Error'];

/** Cheia sub care se păstrează tokenul JWT (în sessionStorage, conform TO-1). */
export const TOKEN_STORAGE_KEY = 'rrm.token';

/** Tokenul sesiunii curente, dacă utilizatorul este autentificat. */
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Păstrează tokenul primit la login (doar în sessionStorage: se pierde la închiderea tab-ului). */
export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/** Șterge tokenul (logout, sesiune expirată). */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Cereri la care un 401 nu înseamnă „sesiune expirată”: la login sunt credențiale greșite, iar la
 * logout utilizatorul pleacă oricum (useLogout curăță și navighează singur).
 */
const URLS_WITHOUT_SESSION_HANDLING = new Set(['/auth/login', '/auth/logout']);

let unauthorizedHandler: (() => void) | undefined;
let sessionExpired = false;

/** `true` dacă utilizatorul a ajuns la login pentru că sesiunea i-a expirat (pentru un mesaj). */
export function wasSessionExpired(): boolean {
  return sessionExpired;
}

/** Șterge semnalul de sesiune expirată (după ce mesajul a fost afișat sau la un login nou). */
export function clearSessionExpired(): void {
  sessionExpired = false;
}

/**
 * Ce se întâmplă când backend-ul răspunde 401 (sesiune expirată, token invalid): de regulă,
 * redirecționarea la /login. Se setează o singură dată, în `App.tsx`, unde există router-ul.
 */
export function setUnauthorizedHandler(handler: (() => void) | undefined): void {
  unauthorizedHandler = handler;
}

/** Instanța Axios folosită de toate apelurile către backend. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      !URLS_WITHOUT_SESSION_HANDLING.has(error.config?.url ?? '')
    ) {
      clearToken();
      sessionExpired = true;
      unauthorizedHandler?.();
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

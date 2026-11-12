import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import type { ApiError } from './client';

/**
 * Doar pentru teste: o eroare Axios cu răspunsul HTTP dat, așa cum o produce apiClient
 * când backend-ul răspunde cu un cod de eroare.
 */
export function httpError(status: number, body: ApiError): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response: AxiosResponse<ApiError> = {
    status,
    statusText: '',
    data: body,
    headers: {},
    config,
  };
  return new AxiosError(body.message, String(status), config, undefined, response);
}

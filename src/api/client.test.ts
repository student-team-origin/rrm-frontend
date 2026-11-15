import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { TOKEN_STORAGE_KEY, apiClient, setUnauthorizedHandler } from './client';
import { httpError } from './testUtils';

/** Un adaptor Axios care răspunde mereu cu 401, ca să ajungem în interceptor. */
function respondWith401(config: InternalAxiosRequestConfig) {
  const error = httpError(401, { code: 'SESIUNE_EXPIRATA', message: 'Sesiunea a expirat.' });
  error.config = config;
  return Promise.reject(error);
}

describe('apiClient', () => {
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    onUnauthorized.mockClear();
    setUnauthorizedHandler(onUnauthorized);
  });

  afterEach(() => {
    setUnauthorizedHandler(undefined);
  });

  it('trimite tokenul în header-ul Authorization', async () => {
    let authorization: unknown;
    await apiClient.get('/resources', {
      adapter: (config) => {
        authorization = AxiosHeaders.from(config.headers).get('Authorization');
        return Promise.resolve({ data: {}, status: 200, statusText: '', headers: {}, config });
      },
    });

    expect(authorization).toBe(`Bearer ${sessionStorage.getItem(TOKEN_STORAGE_KEY)}`);
  });

  it('la 401 șterge tokenul și cheamă redirecționarea la login', async () => {
    await expect(apiClient.get('/resources', { adapter: respondWith401 })).rejects.toThrow();

    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('un 401 la login (credențiale greșite) nu este o sesiune expirată', async () => {
    await expect(apiClient.post('/auth/login', {}, { adapter: respondWith401 })).rejects.toThrow();

    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).not.toBeNull();
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});

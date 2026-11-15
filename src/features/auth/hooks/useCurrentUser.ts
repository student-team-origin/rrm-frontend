import { useQuery } from '@tanstack/react-query';
import { getToken } from '../../../api/client';
import { getCurrentUser } from '../api';
import { authKeys } from './authKeys';

/**
 * Utilizatorul autentificat (`GET /auth/me`). Se cere doar dacă există un token; un 401 golește
 * tokenul și redirecționează la /login (interceptorul din `api/client.ts`).
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: getToken() !== null,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

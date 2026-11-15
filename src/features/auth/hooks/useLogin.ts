import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveToken } from '../../../api/client';
import { getCurrentUser, login } from '../api';
import type { LoginRequest, LoginResponse } from '../types';
import { authKeys } from './authKeys';

/**
 * Autentificarea: la succes păstrează tokenul și încarcă utilizatorul curent înainte de a
 * întoarce rezultatul, ca pagina următoare să afișeze imediat numele lui.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: LoginRequest): Promise<LoginResponse> => {
      const response = await login(request);
      const token = response.tokens?.accessToken;
      if (!response.twoFactorRequired && token) {
        saveToken(token);
        await queryClient.fetchQuery({
          queryKey: authKeys.currentUser(),
          queryFn: getCurrentUser,
        });
      }
      return response;
    },
  });
}

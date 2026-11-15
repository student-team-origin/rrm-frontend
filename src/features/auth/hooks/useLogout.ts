import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { clearToken } from '../../../api/client';
import { logout } from '../api';

/**
 * Deconectarea: închide sesiunea pe server, apoi șterge tokenul și toate datele din cache (ale
 * utilizatorului care pleacă) și duce la /login. Local se deconectează chiar dacă serverul nu
 * răspunde.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearToken();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}

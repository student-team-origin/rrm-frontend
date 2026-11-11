import { QueryClient } from '@tanstack/react-query';

/** Clientul TanStack Query comun pentru toată aplicația. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Cheile TanStack Query pentru autentificare. */
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'me'] as const,
};

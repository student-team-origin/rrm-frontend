import type { ResourceListParams } from '../types';

/** Cheile TanStack Query pentru catalogul de resurse și nomenclatoarele lui. */
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ResourceListParams) => [...resourceKeys.lists(), params] as const,
  labs: () => [...resourceKeys.all, 'labs'] as const,
  categories: () => [...resourceKeys.all, 'categories'] as const,
};

import type { ResourceListParams } from '../types';

/** Cheile TanStack Query pentru catalogul de resurse și nomenclatoarele lui. */
export const resourceKeys = {
  all: ['resources'] as const,
  lists: () => [...resourceKeys.all, 'list'] as const,
  list: (params: ResourceListParams) => [...resourceKeys.lists(), params] as const,
  labs: () => [...resourceKeys.all, 'labs'] as const,
  categories: () => [...resourceKeys.all, 'categories'] as const,
  detail: (id: number) => [...resourceKeys.all, 'detail', id] as const,
  /**
   * Disponibilitatea (calendarul) unei resurse. Se invalidează după orice schimbare a
   * rezervărilor resursei, ca intervalul eliberat sau ocupat să apară imediat.
   */
  availability: (id: number) => [...resourceKeys.all, 'availability', id] as const,
};

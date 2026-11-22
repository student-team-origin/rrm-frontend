import { skipToken, useQuery } from '@tanstack/react-query';
import { getResource } from '../api';
import { resourceKeys } from './resourceKeys';

/** Detaliile unei resurse (`GET /resources/{id}`). Nu cere nimic cât timp `id` lipsește. */
export function useResource(id: number | undefined) {
  return useQuery({
    queryKey: resourceKeys.detail(id ?? 0),
    queryFn: id === undefined ? skipToken : () => getResource(id),
  });
}

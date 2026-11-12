import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getResources } from '../api';
import type { ResourceListParams } from '../types';
import { resourceKeys } from './resourceKeys';

/**
 * Pagina curentă din catalogul de resurse, pentru filtrele și paginarea date.
 * La schimbarea filtrelor păstrează datele anterioare cât timp se încarcă noile date.
 */
export function useResources(params: ResourceListParams) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: () => getResources(params),
    placeholderData: keepPreviousData,
  });
}

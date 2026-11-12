import { useQuery } from '@tanstack/react-query';
import { getResourceCategories } from '../api';
import { resourceKeys } from './resourceKeys';

/** Lista categoriilor de resurse (nomenclator; rămâne în cache 5 minute). */
export function useResourceCategories() {
  return useQuery({
    queryKey: resourceKeys.categories(),
    queryFn: getResourceCategories,
    staleTime: 5 * 60_000,
  });
}

import { useQuery } from '@tanstack/react-query';
import { getLabs } from '../api';
import { resourceKeys } from './resourceKeys';

/** Lista laboratoarelor (nomenclator; se schimbă rar, deci rămâne în cache 5 minute). */
export function useLabs() {
  return useQuery({
    queryKey: resourceKeys.labs(),
    queryFn: getLabs,
    staleTime: 5 * 60_000,
  });
}

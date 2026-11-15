import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getResource } from '../../resources/api';
import { resourceKeys } from '../../resources/hooks/resourceKeys';

/** Cât timp numele unei resurse e considerat actual (se schimbă rar). */
const RESOURCE_NAME_STALE_MS = 5 * 60 * 1000;

/**
 * Numele resurselor cu id-urile date, după id. O resursă se cere o singură dată, chiar dacă
 * apare în mai multe rezervări; până la răspuns lipsește din rezultat.
 */
export function useResourceNames(ids: readonly number[]): ReadonlyMap<number, string> {
  const uniqueIds = useMemo(() => [...new Set(ids)].sort((a, b) => a - b), [ids]);
  return useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: resourceKeys.detail(id),
      queryFn: () => getResource(id),
      staleTime: RESOURCE_NAME_STALE_MS,
    })),
    combine: (results) =>
      new Map(
        results.flatMap((result, index) =>
          result.data?.denumire ? [[uniqueIds[index], result.data.denumire] as const] : [],
        ),
      ),
  });
}

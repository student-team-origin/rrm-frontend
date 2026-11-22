import { skipToken, useQuery } from '@tanstack/react-query';
import { getResourceAvailability } from '../api';
import type { AvailabilityRange } from '../types';
import { resourceKeys } from './resourceKeys';

/** Poziția id-ului resursei în cheia `resourceKeys.availabilityRange(id, range)`. */
const RESOURCE_ID_KEY_INDEX = 2;

/**
 * Intervalele ocupate ale resursei în intervalul afișat de calendar. Nu cere nimic până nu există
 * și resursa, și intervalul. La navigarea între săptămâni păstrează evenimentele afișate până
 * sosesc cele noi, dar nu și la schimbarea resursei (ar arăta ocupările altei resurse).
 */
export function useResourceAvailability(
  resourceId: number | undefined,
  range: AvailabilityRange | undefined,
) {
  const enabled = resourceId !== undefined && range !== undefined;
  return useQuery({
    queryKey: enabled
      ? resourceKeys.availabilityRange(resourceId, range)
      : resourceKeys.availability(resourceId ?? 0),
    queryFn: enabled ? () => getResourceAvailability(resourceId, range) : skipToken,
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[RESOURCE_ID_KEY_INDEX] === resourceId ? previous : undefined,
  });
}

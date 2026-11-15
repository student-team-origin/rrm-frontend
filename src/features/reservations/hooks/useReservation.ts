import { useQuery } from '@tanstack/react-query';
import { getReservation } from '../api';
import { reservationKeys } from './reservationKeys';

/** Detaliul unei rezervări, cu istoricul aprobărilor. Nu cere nimic cât timp `id` lipsește. */
export function useReservation(id: number | undefined) {
  return useQuery({
    queryKey: reservationKeys.detail(id ?? 0),
    queryFn: () => getReservation(id as number),
    enabled: id !== undefined,
  });
}

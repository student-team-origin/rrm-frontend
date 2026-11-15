import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getMyReservations } from '../api';
import type { ReservationListParams } from '../types';
import { reservationKeys } from './reservationKeys';

/**
 * Pagina curentă din „Rezervările mele”, pentru filtrele și paginarea date. La schimbarea
 * filtrelor păstrează datele anterioare cât timp se încarcă noile date.
 */
export function useMyReservations(params: ReservationListParams) {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: () => getMyReservations(params),
    placeholderData: keepPreviousData,
  });
}

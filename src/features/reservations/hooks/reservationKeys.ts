import type { ReservationListParams } from '../types';

/** Cheile TanStack Query pentru rezervările utilizatorului și granturile pe care rezervă. */
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (params: ReservationListParams) => [...reservationKeys.lists(), params] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
  /** Granturile utilizatorului; soldul lor se schimbă odată cu rezervările, deci stau sub `all`. */
  grants: () => [...reservationKeys.all, 'grants'] as const,
};

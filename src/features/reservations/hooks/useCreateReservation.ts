import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceKeys } from '../../resources/hooks/resourceKeys';
import { createReservation } from '../api';
import type { ReservationInput } from '../types';
import { reservationKeys } from './reservationKeys';

/** Cheia mutației, ca dialogul să știe că o cerere e în curs (`useIsMutating`). */
export const CREATE_RESERVATION_KEY = [...reservationKeys.all, 'create'] as const;

/**
 * Trimite o cerere de rezervare (`POST /reservations`). După succes reîncarcă „Rezervările mele”,
 * soldul granturilor și calendarul resursei, unde intervalul apare ocupat.
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: CREATE_RESERVATION_KEY,
    mutationFn: (input: ReservationInput) => createReservation(input),
    onSuccess: async (_reservation, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: reservationKeys.all }),
        queryClient.invalidateQueries({ queryKey: resourceKeys.availability(input.resursaId) }),
      ]);
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceKeys } from '../../resources/hooks/resourceKeys';
import { cancelReservation } from '../api';
import type { CancelReservationInput } from '../types';
import { reservationKeys } from './reservationKeys';

/**
 * Anulează o rezervare (`POST /reservations/{id}/cancel`). După succes reîncarcă rezervările și
 * calendarul resursei, unde intervalul eliberat devine disponibil.
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CancelReservationInput }) =>
      cancelReservation(id, input),
    onSuccess: async (reservation) => {
      const invalidations = [queryClient.invalidateQueries({ queryKey: reservationKeys.all })];
      if (reservation.resursaId !== undefined) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: resourceKeys.availability(reservation.resursaId),
          }),
        );
      }
      await Promise.all(invalidations);
    },
  });
}
